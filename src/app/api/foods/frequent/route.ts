import { env } from 'cloudflare:workers'

import { getAuthUser } from '@/lib/auth-middleware'
import { getPrisma } from '@/lib/db'

export async function GET(request: Request) {
  const userOrRes = await getAuthUser(request)
  if (userOrRes instanceof Response) return userOrRes
  const user = userOrRes
  const url = new URL(request.url)
  const rawLimit = Number.parseInt(url.searchParams.get('limit') ?? '10', 10)
  const limit = Number.isNaN(rawLimit) ? 10 : Math.min(20, Math.max(1, rawLimit))

  const prisma = getPrisma(env)
  const rows = (await prisma.$queryRaw`
    SELECT f.*, COUNT(m.id) as use_count
    FROM foods f
    INNER JOIN meals m ON m.food_id = f.id
    WHERE m.user_id = ${user.uid}
    GROUP BY f.id
    ORDER BY use_count DESC
    LIMIT ${limit}
  `) as {
    id: string
    name: string
    calories: number
    protein: number
    fat: number
    carbs: number
    serving: string
    created_at: string
  }[]

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
