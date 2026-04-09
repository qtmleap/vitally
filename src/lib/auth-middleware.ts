import { type FirebaseUser, verifyFirebaseToken } from '@/lib/firebase-auth'

/**
 * Get authenticated user from the Authorization header.
 * Returns FirebaseUser on success, or a 401 Response on failure.
 */
export async function getAuthUser(request: Request): Promise<FirebaseUser | Response> {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    return await verifyFirebaseToken(authHeader.slice(7))
  } catch {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
