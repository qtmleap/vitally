import { env } from 'cloudflare:workers'

import { getAuthUser } from '@/lib/auth-middleware'
import { calculateCalorieGoal } from '@/lib/calorie-calc'
import type { Goal } from '@/lib/calorie-calc'
import { getPrisma } from '@/lib/db'
import { profileSchema } from '@/lib/schema'

function toResponse(p: {
  age: number
  heightCm: number
  weightKg: number
  bodyFatPct: number | null
  gender: string
  activityLevel: string
  goal: string
  calorieGoal: number
  aiAdviceModel: string | null
  aiUtilityModel: string | null
}) {
  return {
    age: p.age,
    heightCm: p.heightCm,
    weightKg: p.weightKg,
    bodyFatPct: p.bodyFatPct,
    gender: p.gender,
    activityLevel: p.activityLevel,
    goals: p.goal.split(',') as Goal[],
    calorieGoal: p.calorieGoal,
    aiAdviceModel: p.aiAdviceModel,
    aiUtilityModel: p.aiUtilityModel
  }
}

export async function GET(request: Request) {
  const userOrRes = await getAuthUser(request)
  if (userOrRes instanceof Response) return userOrRes
  const user = userOrRes

  const prisma = getPrisma(env)
  const profile = await prisma.userProfile.findUnique({ where: { userId: user.uid } })

  return Response.json({ profile: profile ? toResponse(profile) : null })
}

export async function PUT(request: Request) {
  const userOrRes = await getAuthUser(request)
  if (userOrRes instanceof Response) return userOrRes
  const user = userOrRes

  const body = await request.json()
  const parsed = profileSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { age, height_cm, weight_kg, body_fat_pct, gender, activity_level, goals } = parsed.data

  const calorieGoal = calculateCalorieGoal({
    age,
    heightCm: height_cm,
    weightKg: weight_kg,
    gender,
    activityLevel: activity_level,
    goals: goals as Goal[]
  })

  const goalStr = goals.join(',')

  const prisma = getPrisma(env)
  const profile = await prisma.userProfile.upsert({
    where: { userId: user.uid },
    update: {
      age,
      heightCm: height_cm,
      weightKg: weight_kg,
      bodyFatPct: body_fat_pct,
      gender,
      activityLevel: activity_level,
      goal: goalStr,
      calorieGoal
    },
    create: {
      userId: user.uid,
      age,
      heightCm: height_cm,
      weightKg: weight_kg,
      bodyFatPct: body_fat_pct,
      gender,
      activityLevel: activity_level,
      goal: goalStr,
      calorieGoal
    }
  })

  return Response.json({ profile: toResponse(profile) })
}
