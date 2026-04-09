import { type FirebaseUser, verifyFirebaseToken } from '@/lib/firebase-auth'

/**
 * Get authenticated user from the Authorization header.
 * Middleware already checks the header exists, but this does the full token verification.
 */
export async function getAuthUser(request: Request): Promise<FirebaseUser> {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    return await verifyFirebaseToken(authHeader.slice(7))
  } catch {
    throw Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
