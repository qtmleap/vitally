'use client'

import { useQuery } from '@tanstack/react-query'
import { usePathname, useRouter } from 'vinext/shims/navigation'
import { useEffect, type ReactNode } from 'react'
import { AuthGuard } from './auth-guard'
import { useAuth } from './auth-provider'
import { api } from '@/lib/api'

const PUBLIC_PATHS = ['/', '/terms', '/privacy']

interface ConditionalAuthGuardProps {
  authenticated: React.ReactNode
  unauthenticated: React.ReactNode
}

/** 認証済みユーザーのプロフィールチェック（QueryClientProvider 内で安全に useQuery を使うため分離） */
function ProfileGate({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const isOnboarding = pathname === '/onboarding'

  const { data: profileData, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: api.profile.get,
    staleTime: Number.POSITIVE_INFINITY
  })

  useEffect(() => {
    if (!isLoading && profileData && !profileData.profile && !isOnboarding) {
      router.push('/onboarding')
    }
  }, [isLoading, profileData, isOnboarding, router])

  useEffect(() => {
    if (!isLoading && profileData?.profile && isOnboarding) {
      router.push('/')
    }
  }, [isLoading, profileData, isOnboarding, router])

  if (isLoading) {
    return (
      <div className='flex h-dvh items-center justify-center'>
        <div className='text-muted-foreground text-sm'>読み込み中...</div>
      </div>
    )
  }

  return <>{children}</>
}

export function ConditionalAuthGuard({ authenticated, unauthenticated }: ConditionalAuthGuardProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading } = useAuth()

  const isPublic = PUBLIC_PATHS.includes(pathname)

  useEffect(() => {
    if (!loading && !user && !isPublic) {
      router.push('/')
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

  return (
    <AuthGuard>
      <ProfileGate>{authenticated}</ProfileGate>
    </AuthGuard>
  )
}
