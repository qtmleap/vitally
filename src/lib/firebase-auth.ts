import { Auth, type KeyStorer } from 'firebase-auth-cloudflare-workers'

const FIREBASE_PROJECT_ID = 'vitally-a056d'

class MemoryKeyStore implements KeyStorer {
  private cache: { value: string; expiresAt: number } | null = null

  async get<T = unknown>(): Promise<T | null> {
    if (!this.cache || Date.now() > this.cache.expiresAt) return null
    return JSON.parse(this.cache.value) as T
  }

  async put(value: string, expirationTtl: number): Promise<void> {
    this.cache = { value, expiresAt: Date.now() + expirationTtl * 1000 }
  }
}

const keyStore = new MemoryKeyStore()

export interface FirebaseUser {
  uid: string
  email: string
  name?: string
  picture?: string
}

export async function verifyFirebaseToken(token: string): Promise<FirebaseUser> {
  const auth = Auth.getOrInitialize(FIREBASE_PROJECT_ID, keyStore)
  const decoded = await auth.verifyIdToken(token)
  return {
    uid: decoded.uid,
    email: decoded.email ?? '',
    name: decoded.name as string | undefined,
    picture: decoded.picture
  }
}
