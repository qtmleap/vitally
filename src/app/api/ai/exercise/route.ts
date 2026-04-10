import { env } from 'cloudflare:workers'
import { DAILY_LIMITS, DEFAULT_UTILITY_MODEL, isModelAllowed } from '@/lib/ai-models'
import { checkAndIncrementAiUsage } from '@/lib/ai-rate-limit'
import { parseAiTextResponse } from '@/lib/ai-response'
import { getAuthUser } from '@/lib/auth-middleware'
import { getPrisma } from '@/lib/db'
import { aiExerciseEstimateSchema } from '@/lib/schema'

export async function POST(request: Request) {
  const userOrRes = await getAuthUser(request)
  if (userOrRes instanceof Response) return userOrRes
  const user = userOrRes

  const prisma = getPrisma(env)

  const allowed = await checkAndIncrementAiUsage(prisma, user.uid, DAILY_LIMITS.free)
  if (!allowed) {
    return Response.json({ error: '本日のAIリクエスト上限に達しました' }, { status: 429 })
  }

  const body = await request.json()
  const parsed = aiExerciseEstimateSchema.safeParse(body)

  if (!parsed.success) {
    return Response.json({ error: 'Invalid input', issues: parsed.error.issues }, { status: 400 })
  }

  const { name, duration_min } = parsed.data
  const modelParam = (body as { model?: string }).model

  const profile = await prisma.userProfile.findUnique({ where: { userId: user.uid } })
  const modelId = modelParam || profile?.aiUtilityModel || DEFAULT_UTILITY_MODEL
  if (!isModelAllowed(modelId, 'exercise', 'free')) {
    return Response.json({ error: 'このモデルは利用できません' }, { status: 403 })
  }

  const result = await env.AI.run(modelId as Parameters<typeof env.AI.run>[0], {
    messages: [
      {
        role: 'system',
        content: `あなたはエクササイズフィジオロジスト（運動生理学者）です。指定された運動と時間に基づいて消費カロリーを概算してください。
MET値を使用して正確に計算してください。体重は平均的な成人（約65kg）と仮定してください。
以下のJSON形式のみで回答してください。説明文は不要です。
{"calories": 数値}`
      },
      {
        role: 'user',
        content: `${name} を ${duration_min} 分間行った場合の消費カロリー`
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
    const data = JSON.parse(match[0])
    return Response.json({ calories: Math.round(Number(data.calories) || 0) })
  } catch {
    return Response.json({ error: 'AI の応答を解析できませんでした', raw: text }, { status: 502 })
  }
}
