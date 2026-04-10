export const SESSION_COOKIE = '__session'
export const SESSION_MAX_AGE = 7 * 24 * 60 * 60 // 604800 seconds

function base64url(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function base64urlDecode(str: string): ArrayBuffer {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/').padEnd(str.length + ((4 - (str.length % 4)) % 4), '=')
  const bytes = Uint8Array.from(atob(padded), (c) => c.charCodeAt(0))
  return bytes.buffer as ArrayBuffer
}

export async function signSessionJwt(payload: { uid: string; email: string }, secret: string): Promise<string> {
  const enc = new TextEncoder()
  const now = Math.floor(Date.now() / 1000)
  const header = base64url(enc.encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).buffer as ArrayBuffer)
  const body = base64url(
    enc.encode(JSON.stringify({ ...payload, iat: now, exp: now + SESSION_MAX_AGE })).buffer as ArrayBuffer
  )
  const data = `${header}.${body}`
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data))
  return `${data}.${base64url(sig)}`
}

export async function verifySessionJwt(token: string, secret: string): Promise<{ uid: string; email: string } | null> {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const [headerPart, bodyPart, sigPart] = parts
    const enc = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    )
    const data = enc.encode(`${headerPart}.${bodyPart}`)
    const sig = base64urlDecode(sigPart)
    const valid = await crypto.subtle.verify('HMAC', key, sig, data)
    if (!valid) return null
    const payload = JSON.parse(new TextDecoder().decode(base64urlDecode(bodyPart)))
    if (typeof payload.exp !== 'number' || payload.exp < Date.now() / 1000) return null
    if (typeof payload.uid !== 'string' || typeof payload.email !== 'string') return null
    return { uid: payload.uid, email: payload.email }
  } catch {
    return null
  }
}

export function sessionCookie(jwt: string): string {
  return `__session=${jwt}; HttpOnly; Secure; SameSite=Lax; Path=/api; Max-Age=604800`
}

export function clearSessionCookie(): string {
  return `__session=; HttpOnly; Secure; SameSite=Lax; Path=/api; Max-Age=0`
}
