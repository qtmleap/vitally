'use client'

import { usePathname } from 'vinext/shims/navigation'
import { AuthGuard } from './auth-guard'
import { useAuth } from './auth-provider'

interface ConditionalAuthGuardProps {
  authenticated: React.ReactNode
  unauthenticated: React.ReactNode
}

export function ConditionalAuthGuard({ authenticated, unauthenticated }: ConditionalAuthGuardProps) {
  const pathname = usePathname()
  const { user, loading } = useAuth()

  if (pathname === '/login' || (!loading && !user)) {
    return <>{unauthenticated}</>
  }

  return <AuthGuard>{authenticated}</AuthGuard>
}
