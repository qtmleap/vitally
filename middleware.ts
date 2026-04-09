import { NextRequest, NextResponse } from 'next/server'
import { verifyFirebaseToken } from '@/lib/firebase-auth'

const PUBLIC_PATHS = ['/api/auth/session', '/api/version']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (PUBLIC_PATHS.some((p) => pathname === p)) {
    return NextResponse.next()
  }

  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const user = await verifyFirebaseToken(authHeader.slice(7))
    const headers = new Headers(request.headers)
    headers.set('X-User-Id', user.uid)
    headers.set('X-User-Email', user.email)
    if (user.name) headers.set('X-User-Name', user.name)
    return NextResponse.next({ request: { headers } })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export const config = {
  matcher: ['/api/:path*']
}
