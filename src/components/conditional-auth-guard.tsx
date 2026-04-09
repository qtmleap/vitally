'use client'

import { usePathname, useRouter } from 'vinext/shims/navigation'
import { useEffect } from 'react'
import { AuthGuard } from './auth-guard'
import { useAuth } from './auth-provider'

const PUBLIC_PATHS = ['/login', '/terms', '/privacy']

interface ConditionalAuthGuardProps {
  authenticated: React.ReactNode
  unauthenticated: React.ReactNode
}

export function ConditionalAuthGuard({ authenticated, unauthenticated }: ConditionalAuthGuardProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading } = useAuth()

  const isPublic = PUBLIC_PATHS.includes(pathname)

  useEffect(() => {
    if (!loading && !user && !isPublic) {
      router.push('/login')
    }
  }, [loading, user, isPublic, router])

  if (isPublic) {
    return <>{unauthenticated}</>
  }

  if (loading) {
    return (
      <div className='flex h-dvh items-center justify-center'>
        <div className='text-muted-foreground text-sm'>読み込み中...</div>
      </div>
    )
  }

  if (!user) return null

  return <AuthGuard>{authenticated}</AuthGuard>
}
