import { env } from 'cloudflare:workers'

import { requireAuth } from '@/lib/auth-middleware'

export async function POST(request: Request) {
  await requireAuth(request)
  const { meals, exercises, date } = (await request.json()) as {
    meals: Array<{ food_name: string; calories: number; meal_type: string; quantity: number }>
    exercises: Array<{ name: string; duration_min: number; calories: number | null }>
    date: string
  }

  const totalCalories = meals.reduce((sum, m) => sum + m.calories * m.quantity, 0)
  const totalExerciseCal = exercises.reduce((sum, e) => sum + (e.calories ?? 0), 0)
  const totalExerciseMin = exercises.reduce((sum, e) => sum + e.duration_min, 0)

  const mealSummary =
    meals.length > 0
      ? meals.map((m) => `${m.food_name}(${Math.round(m.calories * m.quantity)}kcal)`).join(', ')
      : '記録なし'

  const exerciseSummary =
    exercises.length > 0 ? exercises.map((e) => `${e.name}(${e.duration_min}分)`).join(', ') : '記録なし'

  const prompt = `あなたは優しくて励まし上手な健康管理AIアシスタントです。
ユーザーの${date}の記録を見て、褒めるポイントを見つけて励ましてください。
改善点があれば、前向きなアドバイスとして伝えてください。
日本語で、フレンドリーに、2-3文で簡潔に回答してください。

【${date}の記録】
食事: ${mealSummary} (合計 ${Math.round(totalCalories)}kcal)
運動: ${exerciseSummary} (合計 ${totalExerciseMin}分, 消費 ${Math.round(totalExerciseCal)}kcal)

記録がまだない場合は、記録をつけること自体を応援してください。`

  const result = await env.AI.run('@cf/meta/llama-3.1-8b-instruct-fp8', {
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 256
  })

  const text = 'response' in result ? (result.response as string) : ''

  return Response.json({ message: text })
}
