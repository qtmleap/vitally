import { env } from 'cloudflare:workers'
import { DAILY_LIMITS, DEFAULT_UTILITY_MODEL, isModelAllowed } from '@/lib/ai-models'
import { checkAndIncrementAiUsage } from '@/lib/ai-rate-limit'
import { parseAiTextResponse } from '@/lib/ai-response'
import { getAuthUser } from '@/lib/auth-middleware'
import { getPrisma } from '@/lib/db'

export async function POST(request: Request) {
  const userOrRes = await getAuthUser(request)
  if (userOrRes instanceof Response) return userOrRes
  const user = userOrRes

  const prisma = getPrisma(env)

  const allowed = await checkAndIncrementAiUsage(prisma, user.uid, DAILY_LIMITS.free)
  if (!allowed) {
    return Response.json({ error: '本日のAIリクエスト上限に達しました' }, { status: 429 })
  }

  const { name, serving, save, model } = (await request.json()) as {
    name: string
    serving?: string
    save?: boolean
    model?: string
  }

  if (!name) {
    return Response.json({ error: 'name is required' }, { status: 400 })
  }

  const profile = await prisma.userProfile.findUnique({ where: { userId: user.uid } })
  const modelId = model || profile?.aiUtilityModel || DEFAULT_UTILITY_MODEL
  if (!isModelAllowed(modelId, 'nutrition', 'free')) {
    return Response.json({ error: 'このモデルは利用できません' }, { status: 403 })
  }

  const servingText = serving || '1食分'

  const result = await env.AI.run(modelId as Parameters<typeof env.AI.run>[0], {
    messages: [
      {
        role: 'system',
        content: `あなたは栄養士です。指定された食品と量に対する栄養成分を日本の食品成分表に基づいて概算してください。
以下のJSON形式のみで回答してください。説明文は不要です。
{"calories": 数値, "protein": 数値, "fat": 数値, "carbs": 数値}`
      },
      {
        role: 'user',
        content: `食品名: ${name}\n量: ${servingText}\n上記の量あたりの栄養成分を返してください。`
      }
    ],
    max_tokens: 256
  })

  const aiResponse = parseAiTextResponse(result)
  if (!aiResponse) {
    return Response.json({ error: 'AI モデルのレスポンス形式が不正です' }, { status: 502 })
  }
  const text = aiResponse.response

  try {
    const match = text.match(/\{[\s\S]*?\}/)
    if (!match) throw new Error('No JSON found')
    const parsed = JSON.parse(match[0])
    const estimate = {
      calories: Math.round(Number(parsed.calories) || 0),
      protein: Math.round(Number(parsed.protein) || 0),
      fat: Math.round(Number(parsed.fat) || 0),
      carbs: Math.round(Number(parsed.carbs) || 0),
      serving: servingText
    }
    if (save) {
      const food = await prisma.food.create({ data: { name, ...estimate, userId: user.uid } })
      return Response.json(food)
    }
    return Response.json(estimate)
  } catch {
    return Response.json({ error: 'AI の応答を解析できませんでした', raw: text }, { status: 502 })
  }
}
