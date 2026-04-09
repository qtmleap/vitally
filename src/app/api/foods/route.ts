import { env } from 'cloudflare:workers'

import { getAuthUser } from '@/lib/auth-middleware'
import { getPrisma } from '@/lib/db'
import { foodSchema } from '@/lib/schema'

export async function GET(request: Request) {
  const userOrRes = await getAuthUser(request)
  if (userOrRes instanceof Response) return userOrRes
  const user = userOrRes

  const url = new URL(request.url)
  const q = url.searchParams.get('q') ?? ''
  const rawLimit = Number.parseInt(url.searchParams.get('limit') ?? '50', 10)
  const limit = Number.isNaN(rawLimit) ? 50 : Math.min(50, Math.max(1, rawLimit))
  const prisma = getPrisma(env)

  const foods = await prisma.food.findMany({
    where: q ? { userId: user.uid, name: { contains: q } } : { userId: user.uid },
    orderBy: q ? { name: 'asc' } : { createdAt: 'desc' },
    take: limit
  })

  return Response.json(foods)
}

export async function POST(request: Request) {
  const userOrRes = await getAuthUser(request)
  if (userOrRes instanceof Response) return userOrRes
  const user = userOrRes

  const body = await request.json()
  const parsed = foodSchema.safeParse(body)

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const prisma = getPrisma(env)
  const food = await prisma.food.create({ data: { ...parsed.data, userId: user.uid } })

  return Response.json(food, { status: 201 })
}

export async function DELETE(request: Request) {
  const userOrRes = await getAuthUser(request)
  if (userOrRes instanceof Response) return userOrRes
  const user = userOrRes

  const url = new URL(request.url)
  const id = url.searchParams.get('id')

  if (!id) {
    return Response.json({ error: 'id is required' }, { status: 400 })
  }

  const prisma = getPrisma(env)
  await prisma.food.delete({ where: { id, userId: user.uid } })

  return Response.json({ ok: true })
}
