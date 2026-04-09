import { env } from 'cloudflare:workers'

import { getAuthUser } from '@/lib/auth-middleware'
import { getPrisma } from '@/lib/db'
import type { Goal } from '@/lib/calorie-calc'

export async function PUT(request: Request) {
  const userOrRes = await getAuthUser(request)
  if (userOrRes instanceof Response) return userOrRes
  const user = userOrRes

  const { aiAdviceModel, aiUtilityModel } = (await request.json()) as {
    aiAdviceModel?: string
    aiUtilityModel?: string
  }

  const prisma = getPrisma(env)

  const data: Record<string, string | null> = {}
  if (aiAdviceModel !== undefined) data.aiAdviceModel = aiAdviceModel
  if (aiUtilityModel !== undefined) data.aiUtilityModel = aiUtilityModel

  const profile = await prisma.userProfile.update({
    where: { userId: user.uid },
    data
  })

  return Response.json({
    profile: {
      age: profile.age,
      heightCm: profile.heightCm,
      weightKg: profile.weightKg,
      bodyFatPct: profile.bodyFatPct,
      gender: profile.gender,
      activityLevel: profile.activityLevel,
      goals: profile.goal.split(',') as Goal[],
      calorieGoal: profile.calorieGoal,
      aiAdviceModel: profile.aiAdviceModel,
      aiUtilityModel: profile.aiUtilityModel
    }
  })
}
