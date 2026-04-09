'use client'

import { Activity, ChartLine, Sparkles, UtensilsCrossed } from 'lucide-react'
import * as m from 'motion/react-m'
import { useEffect, useState } from 'react'
import { useRouter } from 'vinext/shims/navigation'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/auth-provider'
import { signInWithGoogle } from '@/lib/auth'
import { useSkipAnimation } from '@/lib/use-skip-animation'

function GoogleIcon() {
  return (
    <svg viewBox='0 0 24 24' className='size-5' aria-hidden='true'>
      <path
        d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
        fill='#4285F4'
      />
      <path
        d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
        fill='#34A853'
      />
      <path
        d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z'
        fill='#FBBC05'
      />
      <path
        d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
        fill='#EA4335'
      />
    </svg>
  )
}

const features = [
  {
    icon: UtensilsCrossed,
    title: '食事記録',
    description: '毎日の食事をかんたんに記録。AI が栄養素を自動推定'
  },
  {
    icon: Activity,
    title: '運動記録',
    description: '運動時間と消費カロリーを記録。AI が推定もサポート'
  },
  {
    icon: ChartLine,
    title: 'カロリー管理',
    description: '摂取・消費カロリーをひと目で把握。PFC バランスも表示'
  },
  {
    icon: Sparkles,
    title: 'AI アドバイス',
    description: 'AI があなたの記録を分析して、健康的な食生活をアドバイス'
  }
]

export default function LoginPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [signing, setSigning] = useState(false)
  const skipAnimation = useSkipAnimation()

  useEffect(() => {
    if (!loading && user) {
      router.push('/')
    }
  }, [loading, user, router])

  const handleGoogleSignIn = async () => {
    setSigning(true)
    try {
      await signInWithGoogle()
      router.push('/')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'ログインに失敗しました'
      toast.error(message)
    } finally {
      setSigning(false)
    }
  }

  if (loading || user) {
    return (
      <div className='flex h-dvh items-center justify-center'>
        <div className='text-muted-foreground text-sm'>読み込み中...</div>
      </div>
    )
  }

  return (
    <div className='flex min-h-dvh flex-col px-6 py-12'>
      {/* Hero */}
      <m.div
        className='flex flex-1 flex-col items-center justify-center gap-6'
        initial={skipAnimation ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      >
        <m.div
          className='bg-primary/10 flex size-20 items-center justify-center rounded-3xl'
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.1 }}
        >
          <span className='text-4xl'>🥗</span>
        </m.div>
        <m.div className='text-center' initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <h1 className='text-3xl font-bold tracking-tight'>HealthLog</h1>
          <p className='text-muted-foreground mt-2 text-base'>毎日の食事と運動を記録して、健康的な生活をサポート</p>
        </m.div>
      </m.div>

      {/* Features */}
      <m.div
        className='grid grid-cols-2 gap-3 py-8'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {features.map((feature, i) => (
          <m.div
            key={feature.title}
            className='bg-muted/50 rounded-xl p-3'
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 + i * 0.08, type: 'spring', stiffness: 300, damping: 24 }}
          >
            <feature.icon className='text-primary mb-2 size-5' />
            <p className='text-sm font-medium'>{feature.title}</p>
            <p className='text-muted-foreground mt-0.5 text-xs leading-relaxed'>{feature.description}</p>
          </m.div>
        ))}
      </m.div>

      {/* CTA */}
      <m.div
        className='space-y-3 pb-4'
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Button size='lg' className='w-full gap-3' onClick={handleGoogleSignIn} disabled={signing}>
          <GoogleIcon />
          {signing ? 'ログイン中...' : 'Google で始める'}
        </Button>
        <p className='text-muted-foreground/60 text-center text-xs'>
          ログインすることで利用規約とプライバシーポリシーに同意したものとみなします
        </p>
      </m.div>
    </div>
  )
}
