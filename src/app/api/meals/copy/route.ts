import { env } from 'cloudflare:workers'

import { getPrisma } from '@/lib/db'
import { mealCopySchema } from '@/lib/schema'

export async function POST(request: Request) {
  const body = await request.json()
  const parsed = mealCopySchema.safeParse(body)

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { from_date, to_date, meal_type } = parsed.data
  const where: any = { date: from_date }
  if (meal_type) where.mealType = meal_type

  const prisma = getPrisma(env)
  const sourceMeals = await prisma.meal.findMany({ where })

  if (sourceMeals.length === 0) {
    return Response.json({ error: 'コピー元の食事がありません' }, { status: 404 })
  }

  for (const m of sourceMeals) {
    await prisma.meal.create({
      data: { date: to_date, mealType: m.mealType, foodId: m.foodId, quantity: m.quantity }
    })
  }

  return Response.json({ count: sourceMeals.length }, { status: 201 })
}
