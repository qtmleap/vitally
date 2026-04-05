import { env } from 'cloudflare:workers'

import { getPrisma } from '@/lib/db'
import { exerciseSchema } from '@/lib/schema'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const date = url.searchParams.get('date')

  if (!date) {
    return Response.json({ error: 'date is required' }, { status: 400 })
  }

  const prisma = getPrisma(env)
  const exercises = await prisma.exercise.findMany({
    where: { date },
    orderBy: { createdAt: 'asc' }
  })

  const results = exercises.map((e) => ({
    id: e.id,
    date: e.date,
    name: e.name,
    duration_min: e.durationMin,
    calories: e.calories,
    created_at: e.createdAt
  }))

  return Response.json(results)
}

export async function POST(request: Request) {
  const body = await request.json()
  const parsed = exerciseSchema.safeParse(body)

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { date, name, duration_min, calories } = parsed.data
  const prisma = getPrisma(env)

  const exercise = await prisma.exercise.create({
    data: { date, name, durationMin: duration_min, calories }
  })

  return Response.json(exercise, { status: 201 })
}

export async function DELETE(request: Request) {
  const url = new URL(request.url)
  const id = url.searchParams.get('id')

  if (!id) {
    return Response.json({ error: 'id is required' }, { status: 400 })
  }

  const prisma = getPrisma(env)
  await prisma.exercise.delete({ where: { id } })

  return Response.json({ ok: true })
}
