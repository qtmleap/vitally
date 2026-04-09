import { env } from 'cloudflare:workers'

import { getAuthUser } from '@/lib/auth-middleware'
import { aiExerciseEstimateSchema } from '@/lib/schema'

export async function POST(request: Request) {
  const userOrRes = await getAuthUser(request)
  if (userOrRes instanceof Response) return userOrRes

  const body = await request.json()
  const parsed = aiExerciseEstimateSchema.safeParse(body)

  if (!parsed.success) {
    return Response.json({ error: 'Invalid input', issues: parsed.error.issues }, { status: 400 })
  }

  const { name, duration_min } = parsed.data

  const result = await env.AI.run('@hf/nousresearch/hermes-2-pro-mistral-7b', {
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

  const text = 'response' in result ? (result.response as string) : ''

  try {
    const match = text.match(/\{[\s\S]*?\}/)
    if (!match) throw new Error('No JSON found')
    const data = JSON.parse(match[0])
    return Response.json({ calories: Math.round(Number(data.calories) || 0) })
  } catch {
    return Response.json({ error: 'AI の応答を解析できませんでした', raw: text }, { status: 502 })
  }
}
