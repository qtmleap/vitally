import { env } from 'cloudflare:workers'

import { getPrisma } from '@/lib/db'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const rawLimit = Number.parseInt(url.searchParams.get('limit') ?? '10', 10)
  const limit = Number.isNaN(rawLimit) ? 10 : Math.min(20, Math.max(1, rawLimit))

  const prisma = getPrisma(env)
  const rows = (await prisma.$queryRaw`
    SELECT f.*, COUNT(m.id) as use_count
    FROM foods f
    INNER JOIN meals m ON m.food_id = f.id
    GROUP BY f.id
    ORDER BY use_count DESC
    LIMIT ${limit}
  `) as any[]

  const foods = rows.map((r) => ({
    id: r.id,
    name: r.name,
    calories: r.calories,
    protein: r.protein,
    fat: r.fat,
    carbs: r.carbs,
    serving: r.serving,
    createdAt: r.created_at
  }))

  return Response.json(foods)
}
