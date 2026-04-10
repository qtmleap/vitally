import { env } from 'cloudflare:workers'

const FIREBASE_PROJECT_ID = 'vitally-a056d'
const JWKS_URL = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'

interface KeyCache {
  keys: Record<string, CryptoKey>
  expiresAt: number
}

let keyCache: KeyCache | null = null

interface JwkKey {
  kid: string
  kty: string
  alg: string
  n: string
  e: string
  use: string
}

async function getPublicKeys(): Promise<Record<string, CryptoKey>> {
  const now = Date.now()
  if (keyCache && keyCache.expiresAt > now) {
    return keyCache.keys
  }

  const res = await fetch(JWKS_URL)
  if (!res.ok) throw new Error(`Failed to fetch Google JWKS: ${res.status}`)

  const jwks = (await res.json()) as { keys: JwkKey[] }
  const keys: Record<string, CryptoKey> = {}
  await Promise.all(
    jwks.keys.map(async (jwk) => {
      keys[jwk.kid] = await crypto.subtle.importKey(
        'jwk',
        { kty: jwk.kty, n: jwk.n, e: jwk.e, alg: 'RS256', ext: true },
        { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
        false,
        ['verify']
      )
    })
  )

  const cacheControl = res.headers.get('cache-control') ?? ''
  const maxAgeMatch = cacheControl.match(/max-age=(\d+)/)
  const ttl = maxAgeMatch ? Number.parseInt(maxAgeMatch[1], 10) * 1000 : 3600_000
  keyCache = { keys, expiresAt: now + ttl }

  return keys
}

function base64UrlDecode(str: string): Uint8Array<ArrayBuffer> {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/').padEnd(str.length + ((4 - (str.length % 4)) % 4), '=')
  const buf = new ArrayBuffer(atob(padded).length)
  const view = new Uint8Array(buf)
  const decoded = atob(padded)
  for (let i = 0; i < decoded.length; i++) {
    view[i] = decoded.charCodeAt(i)
  }
  return view
}

function base64UrlDecodeJson(str: string): unknown {
  return JSON.parse(new TextDecoder().decode(base64UrlDecode(str)))
}

export interface FirebaseUser {
  uid: string
  email: string
  name?: string
  picture?: string
}

export async function verifyFirebaseToken(token: string): Promise<FirebaseUser> {
  const parts = token.split('.')
  if (parts.length !== 3) throw new Error('Invalid JWT format')

  const [headerB64, payloadB64, signatureB64] = parts

  const header = base64UrlDecodeJson(headerB64) as { kid?: string; alg?: string }

  // エミュレータのトークンは alg:"none" で署名なし — USE_FIREBASE_EMULATOR が設定されている場合のみスキップ
  const isEmulatorToken = header.alg === 'none' && (env as unknown as Record<string, unknown>).USE_FIREBASE_EMULATOR === 'true'
  if (!isEmulatorToken) {
    if (header.alg !== 'RS256') throw new Error(`Unsupported algorithm: ${header.alg}`)
    if (!header.kid) throw new Error('Missing kid in JWT header')

    const keys = await getPublicKeys()
    const key = keys[header.kid]
    if (!key) throw new Error(`Unknown kid: ${header.kid}`)

    const signedData = new TextEncoder().encode(`${headerB64}.${payloadB64}`)
    const signature = base64UrlDecode(signatureB64)

    const valid = await crypto.subtle.verify({ name: 'RSASSA-PKCS1-v1_5' }, key, signature, signedData)
    if (!valid) throw new Error('Invalid JWT signature')
  }

  const payload = base64UrlDecodeJson(payloadB64) as {
    iss?: string
    aud?: string
    exp?: number
    sub?: string
    email?: string
    name?: string
    picture?: string
  }

  const now = Math.floor(Date.now() / 1000)

  if (payload.iss !== `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`) {
    throw new Error(`Invalid issuer: ${payload.iss}`)
  }
  if (payload.aud !== FIREBASE_PROJECT_ID) {
    throw new Error(`Invalid audience: ${payload.aud}`)
  }
  if (!payload.exp || payload.exp <= now) {
    throw new Error('Token expired')
  }
  if (!payload.sub) {
    throw new Error('Missing sub claim')
  }

  return {
    uid: payload.sub,
    email: payload.email ?? '',
    name: payload.name,
    picture: payload.picture
  }
}
