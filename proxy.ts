import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_PATHS = ['/api/auth/session', '/api/version']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (PUBLIC_PATHS.some((p) => pathname === p)) {
    return NextResponse.next()
  }

  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/:path*']
}
