import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_PATHS = ['/api/auth/session', '/api/auth/signout', '/api/version']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (PUBLIC_PATHS.some((p) => pathname === p)) {
    return NextResponse.next()
  }

  const cookies = request.headers.get('Cookie') ?? ''
  if (!cookies.includes('__session=')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/:path*']
}
