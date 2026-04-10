'use client'

import { useEffect } from 'react'
import { useRouter } from 'vinext/shims/navigation'
import { useAuth } from '@/components/auth-provider'
import { LandingPage } from '@/components/landing-page'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push('/me')
    }
  }, [loading, user, router])

  if (loading || user) {
    return (
      <div className='flex h-dvh items-center justify-center'>
        <div className='text-muted-foreground text-sm'>読み込み中...</div>
      </div>
    )
  }

  return <LandingPage />
}
