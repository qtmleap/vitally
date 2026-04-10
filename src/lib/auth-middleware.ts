import { env } from 'cloudflare:workers'

import { SESSION_COOKIE, verifySessionJwt } from '@/lib/session'

export interface FirebaseUser {
  uid: string
  email: string
  name?: string
  picture?: string
}

function parseCookie(header: string, name: string): string | null {
  const match = header.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`))
  return match ? match[1] : null
}

export async function getAuthUser(request: Request): Promise<FirebaseUser | Response> {
  const cookieHeader = request.headers.get('Cookie') ?? ''
  const token = parseCookie(cookieHeader, SESSION_COOKIE)
  if (!token) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const session = await verifySessionJwt(token, env.SESSION_SECRET)
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return { uid: session.uid, email: session.email }
}
