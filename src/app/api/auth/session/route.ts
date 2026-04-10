import { env } from 'cloudflare:workers'

import { getPrisma } from '@/lib/db'
import { verifyFirebaseToken } from '@/lib/firebase-auth'
import { sessionCookie, signSessionJwt } from '@/lib/session'

export async function POST(request: Request) {
  const body = (await request.json()) as { token?: string }
  if (!body.token) {
    return Response.json({ error: 'token is required' }, { status: 400 })
  }

  let firebaseUser: Awaited<ReturnType<typeof verifyFirebaseToken>>
  try {
    firebaseUser = await verifyFirebaseToken(body.token)
  } catch {
    return Response.json({ error: 'Invalid token' }, { status: 401 })
  }

  const prisma = getPrisma(env)

  const user = await prisma.user.upsert({
    where: { id: firebaseUser.uid },
    update: {
      email: firebaseUser.email,
      displayName: firebaseUser.name ?? null,
      photoUrl: firebaseUser.picture ?? null
    },
    create: {
      id: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.name ?? null,
      photoUrl: firebaseUser.picture ?? null
    }
  })

  const jwt = await signSessionJwt({ uid: firebaseUser.uid, email: firebaseUser.email }, env.SESSION_SECRET)
  const responseBody = JSON.stringify({
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    photoUrl: user.photoUrl,
    createdAt: user.createdAt
  })
  return new Response(responseBody, {
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': sessionCookie(jwt)
    }
  })
}
