import { env } from 'cloudflare:workers'

import { getAuthUser } from '@/lib/auth-middleware'
import { getPrisma } from '@/lib/db'
import { mealCopySchema } from '@/lib/schema'

export async function POST(request: Request) {
  const user = getAuthUser(request)
  const body = await request.json()
  const parsed = mealCopySchema.safeParse(body)

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { from_date, to_date, meal_type } = parsed.data
  const where: { date: string; mealType?: string; userId: string } = { date: from_date, userId: user.uid }
  if (meal_type) where.mealType = meal_type

  const prisma = getPrisma(env)
  const sourceMeals = await prisma.meal.findMany({ where })

  if (sourceMeals.length === 0) {
    return Response.json({ error: 'コピー元の食事がありません' }, { status: 404 })
  }

  for (const m of sourceMeals) {
    await prisma.meal.create({
      data: { date: to_date, mealType: m.mealType, foodId: m.foodId, quantity: m.quantity, userId: user.uid }
    })
  }

  return Response.json({ count: sourceMeals.length }, { status: 201 })
}
