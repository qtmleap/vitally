import { type FirebaseUser, verifyFirebaseToken } from '@/lib/firebase-auth'

export async function getAuthUser(request: Request): Promise<FirebaseUser> {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Missing or invalid Authorization header')
  }
  const token = authHeader.slice(7)
  return verifyFirebaseToken(token)
}

export async function requireAuth(request: Request): Promise<FirebaseUser> {
  try {
    return await getAuthUser(request)
  } catch {
    throw Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
