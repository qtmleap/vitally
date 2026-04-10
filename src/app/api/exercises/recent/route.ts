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
  const rows = await prisma.exercise.findMany({
    where: { userId: user.uid },
    orderBy: { createdAt: 'desc' },
    take: 50,
    select: { name: true }
  })

  const seen = new Set<string>()
  const names: string[] = []
  for (const r of rows) {
    if (seen.has(r.name)) continue
    seen.add(r.name)
    names.push(r.name)
    if (names.length >= limit) break
  }

  return Response.json(names.map((name) => ({ name })))
}
