'use client'

import { useAuth } from '@/components/auth-provider'
import { Dashboard } from '@/components/dashboard'
import { LandingPage } from '@/components/landing-page'

export default function Home() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className='flex h-dvh items-center justify-center'>
        <div className='text-muted-foreground text-sm'>読み込み中...</div>
      </div>
    )
  }

  if (!user) return <LandingPage />

  return <Dashboard />
}
