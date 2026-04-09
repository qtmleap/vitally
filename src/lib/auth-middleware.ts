export interface AuthUser {
  uid: string
  email: string
  name?: string
}

/**
 * Get authenticated user from middleware-injected headers.
 * Middleware has already verified the token and set X-User-Id / X-User-Email.
 */
export function getAuthUser(request: Request): AuthUser {
  const uid = request.headers.get('X-User-Id')
  const email = request.headers.get('X-User-Email') ?? ''
  const name = request.headers.get('X-User-Name') ?? undefined

  if (!uid) {
    throw Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return { uid, email, name }
}
