import { env } from 'cloudflare:workers'

const schema = {
  type: 'object',
  properties: {
    calories: { type: 'number', description: 'カロリー (kcal)' },
    protein: { type: 'number', description: 'タンパク質 (g)' },
    fat: { type: 'number', description: '脂質 (g)' },
    carbs: { type: 'number', description: '炭水化物 (g)' },
    serving: { type: 'string', description: '1食分の量の説明 (例: 100g, 1個, 1杯)' }
  },
  required: ['calories', 'protein', 'fat', 'carbs', 'serving']
}

export async function POST(request: Request) {
  const { name, serving } = (await request.json()) as { name: string; serving?: string }

  if (!name) {
    return Response.json({ error: 'name is required' }, { status: 400 })
  }

  const result = await env.AI.run(
    '@hf/nousresearch/hermes-2-pro-mistral-7b' as BaseAiTextGenerationModels,
    {
      messages: [
        {
          role: 'system',
          content:
            'あなたは栄養士です。食品の栄養成分を日本の食品成分表に基づいて概算してください。JSONのみで回答してください。'
        },
        {
          role: 'user',
          content: `食品名: ${name}\n量: ${serving || '1食分（一般的な量）'}\n\n上記の栄養成分をJSONで返してください。`
        }
      ],
      response_format: {
        type: 'json_schema' as const,
        json_schema: { name: 'nutrition', schema }
      },
      max_tokens: 256
    } as Parameters<typeof env.AI.run>[1]
  )

  const text = 'response' in result ? (result.response as string) : ''

  try {
    const parsed = JSON.parse(text)
    return Response.json({
      calories: Math.round(Number(parsed.calories) || 0),
      protein: Math.round(Number(parsed.protein) || 0),
      fat: Math.round(Number(parsed.fat) || 0),
      carbs: Math.round(Number(parsed.carbs) || 0),
      serving: String(parsed.serving || '1食分')
    })
  } catch {
    return Response.json({ error: 'AI の応答を解析できませんでした', raw: text }, { status: 502 })
  }
}
