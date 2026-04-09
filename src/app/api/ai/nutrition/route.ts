import { env } from 'cloudflare:workers'

import { requireAuth } from '@/lib/auth-middleware'
import { getPrisma } from '@/lib/db'

export async function POST(request: Request) {
  await requireAuth(request)
  const { name, serving, save } = (await request.json()) as { name: string; serving?: string; save?: boolean }

  if (!name) {
    return Response.json({ error: 'name is required' }, { status: 400 })
  }

  const result = await env.AI.run('@hf/nousresearch/hermes-2-pro-mistral-7b', {
    messages: [
      {
        role: 'system',
        content: `あなたは栄養士です。食品の栄養成分を日本の食品成分表に基づいて概算してください。
以下のJSON形式のみで回答してください。説明文は不要です。
{"calories": 数値, "protein": 数値, "fat": 数値, "carbs": 数値, "serving": "量の説明"}`
      },
      {
        role: 'user',
        content: `食品名: ${name}\n量: ${serving || '1食分（一般的な量）'}`
      }
    ],
    max_tokens: 256
  })

  const text = 'response' in result ? (result.response as string) : ''

  try {
    const match = text.match(/\{[\s\S]*?\}/)
    if (!match) throw new Error('No JSON found')
    const parsed = JSON.parse(match[0])
    const estimate = {
      calories: Math.round(Number(parsed.calories) || 0),
      protein: Math.round(Number(parsed.protein) || 0),
      fat: Math.round(Number(parsed.fat) || 0),
      carbs: Math.round(Number(parsed.carbs) || 0),
      serving: String(parsed.serving || '1食分')
    }
    if (save) {
      const prisma = getPrisma(env)
      const food = await prisma.food.create({ data: { name, ...estimate } })
      return Response.json(food)
    }
    return Response.json(estimate)
  } catch {
    return Response.json({ error: 'AI の応答を解析できませんでした', raw: text }, { status: 502 })
  }
}
