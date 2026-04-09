'use client'
import { usePathname } from 'vinext/shims/navigation'
import { AuthGuard } from './auth-guard'

export function ConditionalAuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (pathname === '/login') {
    return <>{children}</>
  }

  return <AuthGuard>{children}</AuthGuard>
}
