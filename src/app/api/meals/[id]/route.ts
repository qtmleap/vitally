import { env } from 'cloudflare:workers'

import { getAuthUser } from '@/lib/auth-middleware'
import { getPrisma } from '@/lib/db'
import { mealUpdateSchema } from '@/lib/schema'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userOrRes = await getAuthUser(request)
  if (userOrRes instanceof Response) return userOrRes
  const user = userOrRes
  const { id } = await params
  const prisma = getPrisma(env)

  const meal = await prisma.meal.findUnique({
    where: { id, userId: user.uid },
    include: { food: true }
  })

  if (!meal) {
    return Response.json({ error: 'Not found' }, { status: 404 })
  }

  return Response.json({
    id: meal.id,
    date: meal.date,
    meal_type: meal.mealType,
    food_id: meal.foodId,
    quantity: meal.quantity,
    created_at: meal.createdAt,
    food_name: meal.food.name,
    food_calories: meal.food.calories,
    food_protein: meal.food.protein,
    food_fat: meal.food.fat,
    food_carbs: meal.food.carbs
  })
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userOrRes = await getAuthUser(request)
  if (userOrRes instanceof Response) return userOrRes
  const user = userOrRes
  const { id } = await params
  const body = await request.json()
  const parsed = mealUpdateSchema.safeParse(body)

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { meal_type, food_id, quantity } = parsed.data
  const prisma = getPrisma(env)

  const data: Record<string, unknown> = {}
  if (meal_type !== undefined) data.mealType = meal_type
  if (food_id !== undefined) data.foodId = food_id
  if (quantity !== undefined) data.quantity = quantity

  const meal = await prisma.meal.update({
    where: { id, userId: user.uid },
    data,
    include: { food: true }
  })

  return Response.json({
    id: meal.id,
    date: meal.date,
    meal_type: meal.mealType,
    food_id: meal.foodId,
    quantity: meal.quantity,
    created_at: meal.createdAt,
    food_name: meal.food.name,
    food_calories: meal.food.calories,
    food_protein: meal.food.protein,
    food_fat: meal.food.fat,
    food_carbs: meal.food.carbs
  })
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userOrRes = await getAuthUser(request)
  if (userOrRes instanceof Response) return userOrRes
  const user = userOrRes
  const { id } = await params
  const prisma = getPrisma(env)

  await prisma.meal.delete({ where: { id, userId: user.uid } })

  return Response.json({ ok: true })
}
