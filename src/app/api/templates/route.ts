import { env } from 'cloudflare:workers'

import { getAuthUser } from '@/lib/auth-middleware'
import { getPrisma } from '@/lib/db'
import { mealTemplateCreateSchema } from '@/lib/schema'

export async function GET(request: Request) {
  const user = await getAuthUser(request)
  const prisma = getPrisma(env)
  const templates = await prisma.mealTemplate.findMany({
    where: { userId: user.uid },
    include: { items: { include: { food: true } } },
    orderBy: { createdAt: 'desc' }
  })
  return Response.json(templates)
}

export async function POST(request: Request) {
  const user = await getAuthUser(request)
  const body = await request.json()
  const parsed = mealTemplateCreateSchema.safeParse(body)

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { name, meal_type, items } = parsed.data
  const prisma = getPrisma(env)

  const template = await prisma.mealTemplate.create({
    data: {
      name,
      mealType: meal_type,
      userId: user.uid,
      items: { create: items.map((i) => ({ foodId: i.food_id, quantity: i.quantity })) }
    },
    include: { items: { include: { food: true } } }
  })

  return Response.json(template, { status: 201 })
}

export async function DELETE(request: Request) {
  const user = await getAuthUser(request)
  const url = new URL(request.url)
  const id = url.searchParams.get('id')

  if (!id) {
    return Response.json({ error: 'id is required' }, { status: 400 })
  }

  const prisma = getPrisma(env)
  await prisma.mealTemplate.delete({ where: { id, userId: user.uid } })

  return Response.json({ ok: true })
}
