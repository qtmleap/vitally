'use client'

import { useQuery } from '@tanstack/react-query'
import { usePathname, useRouter } from 'vinext/shims/navigation'
import { useEffect } from 'react'
import { AuthGuard } from './auth-guard'
import { useAuth } from './auth-provider'
import { api } from '@/lib/api'

const PUBLIC_PATHS = ['/', '/terms', '/privacy']

interface ConditionalAuthGuardProps {
  authenticated: React.ReactNode
  unauthenticated: React.ReactNode
}

export function ConditionalAuthGuard({ authenticated, unauthenticated }: ConditionalAuthGuardProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading } = useAuth()

  const isPublic = PUBLIC_PATHS.includes(pathname)
  const isOnboarding = pathname === '/onboarding'

  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: api.profile.get,
    enabled: !!user,
    staleTime: Number.POSITIVE_INFINITY
  })

  useEffect(() => {
    if (!loading && !user && !isPublic) {
      router.push('/')
    }
  }, [loading, user, isPublic, router])

  // プロフィール未作成 → オンボーディングへ
  useEffect(() => {
    if (user && !profileLoading && profileData && !profileData.profile && !isOnboarding && !isPublic) {
      router.push('/onboarding')
    }
  }, [user, profileLoading, profileData, isOnboarding, isPublic, router])

  // プロフィール作成済み → オンボーディングから離脱
  useEffect(() => {
    if (user && !profileLoading && profileData?.profile && isOnboarding) {
      router.push('/')
    }
  }, [user, profileLoading, profileData, isOnboarding, router])

  if (isPublic) {
    return <>{unauthenticated}</>
  }

  if (loading || (user && profileLoading)) {
    return (
      <div className='flex h-dvh items-center justify-center'>
        <div className='text-muted-foreground text-sm'>読み込み中...</div>
      </div>
    )
  }

  if (!user) return null

  return <AuthGuard>{authenticated}</AuthGuard>
}
