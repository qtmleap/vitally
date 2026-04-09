import { env } from 'cloudflare:workers'

import { getAuthUser } from '@/lib/auth-middleware'
import { getPrisma } from '@/lib/db'
import { mealSchema } from '@/lib/schema'

export async function GET(request: Request) {
  const user = await getAuthUser(request)
  const url = new URL(request.url)
  const date = url.searchParams.get('date')

  if (!date) {
    return Response.json({ error: 'date is required' }, { status: 400 })
  }

  const prisma = getPrisma(env)
  const meals = await prisma.meal.findMany({
    where: { userId: user.uid, date },
    include: { food: true },
    orderBy: [{ createdAt: 'asc' }]
  })

  const results = meals.map((m) => ({
    id: m.id,
    date: m.date,
    meal_type: m.mealType,
    food_id: m.foodId,
    quantity: m.quantity,
    created_at: m.createdAt,
    food_name: m.food.name,
    food_calories: m.food.calories,
    food_protein: m.food.protein,
    food_fat: m.food.fat,
    food_carbs: m.food.carbs
  }))

  return Response.json(results)
}

export async function POST(request: Request) {
  const user = await getAuthUser(request)
  const body = await request.json()
  const parsed = mealSchema.safeParse(body)

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { date, meal_type, food_id, quantity } = parsed.data
  const prisma = getPrisma(env)

  const meal = await prisma.meal.create({
    data: { date, mealType: meal_type, foodId: food_id, quantity, userId: user.uid }
  })

  return Response.json(meal, { status: 201 })
}

export async function DELETE(request: Request) {
  const user = await getAuthUser(request)
  const url = new URL(request.url)
  const id = url.searchParams.get('id')

  if (!id) {
    return Response.json({ error: 'id is required' }, { status: 400 })
  }

  const prisma = getPrisma(env)
  await prisma.meal.delete({ where: { id, userId: user.uid } })

  return Response.json({ ok: true })
}
