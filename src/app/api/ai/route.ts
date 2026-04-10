import { env } from 'cloudflare:workers'
import { DAILY_LIMITS, DEFAULT_ADVICE_MODEL, isModelAllowed } from '@/lib/ai-models'
import { checkAndIncrementAiUsage } from '@/lib/ai-rate-limit'
import { getAuthUser } from '@/lib/auth-middleware'
import { getPrisma } from '@/lib/db'
import type { ActivityLevel, Gender, GoalType } from '@/lib/schema'
import { activityLevelLabels, genderLabels, goalLabels } from '@/lib/schema'

export async function POST(request: Request) {
  try {
    const userOrRes = await getAuthUser(request)
    if (userOrRes instanceof Response) return userOrRes
    const user = userOrRes

    const prisma = getPrisma(env)

    const allowed = await checkAndIncrementAiUsage(prisma, user.uid, DAILY_LIMITS.free)
    if (!allowed) {
      return Response.json({ error: '本日のAIリクエスト上限に達しました' }, { status: 429 })
    }

    const body = (await request.json()) as {
      meals: Array<{ food_name: string; calories: number; meal_type: string; quantity: number }>
      exercises: Array<{ name: string; duration_min: number; calories: number | null }>
      date: string
      model?: string
    }

    const profile = await prisma.userProfile.findUnique({ where: { userId: user.uid } })
    const modelId = body.model || profile?.aiAdviceModel || DEFAULT_ADVICE_MODEL
    if (!isModelAllowed(modelId, 'advice', 'free')) {
      return Response.json({ error: 'このモデルは利用できません' }, { status: 403 })
    }

    const { meals, exercises, date } = body

    const totalCalories = meals.reduce((sum, m) => sum + m.calories * m.quantity, 0)
    const totalExerciseCal = exercises.reduce((sum, e) => sum + (e.calories ?? 0), 0)
    const totalExerciseMin = exercises.reduce((sum, e) => sum + e.duration_min, 0)

    const mealSummary =
      meals.length > 0
        ? meals.map((m) => `${m.food_name}(${Math.round(m.calories * m.quantity)}kcal)`).join(', ')
        : '記録なし'

    const exerciseSummary =
      exercises.length > 0 ? exercises.map((e) => `${e.name}(${e.duration_min}分)`).join(', ') : '記録なし'

    const goalsText = profile?.goal
      ? (JSON.parse(profile.goal as unknown as string) as string[])
          .map((g) => goalLabels[g as GoalType] ?? g)
          .join('、')
      : ''

    const profileSection = profile
      ? `【ユーザー情報】
性別: ${genderLabels[profile.gender as Gender] ?? profile.gender}
年齢: ${profile.age}歳
身長: ${profile.heightCm}cm / 体重: ${profile.weightKg}kg${profile.bodyFatPct ? ` / 体脂肪率: ${profile.bodyFatPct}%` : ''}
活動レベル: ${activityLevelLabels[profile.activityLevel as ActivityLevel] ?? profile.activityLevel}
目標: ${goalsText}
1日の目標カロリー: ${profile.calorieGoal}kcal
`
      : ''

    const prompt = `あなたは優しくて励まし上手な健康管理AIアシスタントです。
ユーザーのプロフィールと目標を考慮した上で、${date}の記録を評価してください。
褒めるポイントを見つけて励まし、改善点があれば前向きなアドバイスとして伝えてください。
日本語で、フレンドリーに、2-3文で簡潔に回答してください。

${profileSection}【${date}の記録】
食事: ${mealSummary} (合計 ${Math.round(totalCalories)}kcal)
運動: ${exerciseSummary} (合計 ${totalExerciseMin}分, 消費 ${Math.round(totalExerciseCal)}kcal)

記録がまだない場合は、記録をつけること自体を応援してください。`

    const result = await env.AI.run(modelId as Parameters<typeof env.AI.run>[0], {
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 256
    })

    const text =
      typeof result === 'object' && result !== null && 'response' in result ? (result.response as string) : ''

    return Response.json({ message: text })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('POST /api/ai error:', msg)
    return Response.json({ error: msg }, { status: 500 })
  }
}
