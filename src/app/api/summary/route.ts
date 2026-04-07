import { env } from 'cloudflare:workers'

import { getPrisma } from '@/lib/db'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const from = url.searchParams.get('from')
  const to = url.searchParams.get('to')

  if (!from || !to) {
    return Response.json({ error: 'from and to are required' }, { status: 400 })
  }

  const prisma = getPrisma(env)

  const [meals, exercises] = await Promise.all([
    prisma.meal.findMany({
      where: { date: { gte: from, lte: to } },
      include: { food: true }
    }),
    prisma.exercise.findMany({
      where: { date: { gte: from, lte: to } }
    })
  ])

  const days: Record<string, { calories: number; exercise_min: number }> = {}

  for (const m of meals) {
    const d = (days[m.date] ??= { calories: 0, exercise_min: 0 })
    d.calories += m.food.calories * m.quantity
  }

  for (const e of exercises) {
    const d = (days[e.date] ??= { calories: 0, exercise_min: 0 })
    d.exercise_min += e.durationMin
  }

  return Response.json(days)
}
