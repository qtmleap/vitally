'use client'

import { Activity, ChartLine, Flame, Footprints, Sparkles, Star, UtensilsCrossed } from 'lucide-react'
import * as m from 'motion/react-m'
import { useEffect, useState } from 'react'
import { useRouter } from 'vinext/shims/navigation'
import { toast } from 'sonner'

import Link from 'vinext/shims/link'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/auth-provider'
import { signInWithGoogle } from '@/lib/auth'
import { useSkipAnimation } from '@/lib/use-skip-animation'
import { ForceLightMode } from '@/components/force-light-mode'

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

function FloatingCard({
  children,
  className,
  delay
}: {
  children: React.ReactNode
  className: string
  delay: number
}) {
  return (
    <m.div
      className={className}
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, type: 'spring', stiffness: 300, damping: 24 }}
    >
      {children}
    </m.div>
  )
}

const features = [
  {
    icon: UtensilsCrossed,
    title: '食事記録',
    description: '毎日の食事をかんたんに記録。AI が栄養素を自動推定します。'
  },
  {
    icon: Activity,
    title: '運動記録',
    description: '運動時間と消費カロリーを記録。AI が推定もサポートします。'
  },
  {
    icon: ChartLine,
    title: 'カロリー管理',
    description: '摂取・消費カロリーをひと目で把握。PFC バランスも表示。'
  },
  {
    icon: Sparkles,
    title: 'AI アドバイス',
    description: 'AI があなたの記録を分析して、健康的な食生活をアドバイス。'
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
      const msg = err instanceof Error ? err.message : ''
      if (msg.includes('popup-closed-by-user') || msg.includes('cancelled-popup-request')) {
        toast('ログインがキャンセルされました')
      } else {
        toast.error(msg || 'ログインに失敗しました')
      }
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

  const init = (v: Record<string, number>) => (skipAnimation ? false : v)

  return (
    <div className='flex min-h-dvh flex-col'>
      <ForceLightMode />
      {/* Hero Section */}
      <section className='relative flex flex-col items-center justify-center px-6 pb-16 pt-20 lg:pb-24 lg:pt-32'>
        {/* Background decoration */}
        <div className='pointer-events-none absolute inset-0 overflow-hidden' aria-hidden='true'>
          <div className='bg-primary/5 absolute -right-20 -top-20 size-80 rounded-full blur-3xl lg:size-[500px]' />
          <div className='bg-primary/5 absolute -bottom-20 -left-20 size-60 rounded-full blur-3xl lg:size-96' />
        </div>

        <div className='relative z-10 mx-auto w-full max-w-7xl'>
          {/* Header text */}
          <m.div
            className='text-center'
            initial={init({ opacity: 0, y: 24 })}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          >
            <m.div
              className='bg-primary/10 text-primary mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium'
              initial={init({ opacity: 0, scale: 0.9 })}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Sparkles className='size-4' />
              AI でスマートに健康管理
            </m.div>
            <h1 className='text-4xl font-bold tracking-tight lg:text-6xl'>
              あなたの健康を
              <br />
              <span className='text-primary'>もっとシンプルに</span>
            </h1>
            <p className='text-muted-foreground mx-auto mt-4 max-w-md text-base lg:mt-6 lg:max-w-lg lg:text-lg'>
              食事と運動を記録して、AI がアドバイス。毎日の健康管理をサポートするパートナーです。
            </p>
            <m.div
              className='mt-8'
              initial={init({ opacity: 0, y: 12 })}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                size='lg'
                className='h-12 gap-3 rounded-full px-8 text-base shadow-lg'
                onClick={handleGoogleSignIn}
                disabled={signing}
              >
                <GoogleIcon />
                {signing ? 'ログイン中...' : 'Google で始める'}
              </Button>
            </m.div>
          </m.div>

          {/* Floating stat cards */}
          <div className='relative mx-auto mt-12 h-64 max-w-sm lg:mt-16 lg:h-72 lg:max-w-xl'>
            {/* Center phone mockup outline */}
            <m.div
              className='border-border/50 bg-card absolute left-1/2 top-1/2 z-10 h-44 w-24 -translate-x-1/2 -translate-y-1/2 rounded-3xl border-2 shadow-2xl lg:h-52 lg:w-28'
              initial={init({ opacity: 0, y: 30 })}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 300, damping: 24 }}
            >
              <div className='bg-muted mx-auto mt-2 h-1 w-10 rounded-full' />
              <div className='flex flex-col items-center justify-center gap-2 pt-6'>
                <div className='text-primary text-2xl font-bold lg:text-3xl'>1,520</div>
                <div className='text-muted-foreground text-[10px]'>kcal 摂取</div>
                <div className='bg-primary/20 mt-1 h-1.5 w-14 overflow-hidden rounded-full'>
                  <div className='bg-primary h-full w-3/4 rounded-full' />
                </div>
              </div>
            </m.div>

            {/* Floating cards around the phone */}
            <FloatingCard
              className='bg-card absolute left-0 top-0 z-20 rounded-2xl p-3 shadow-lg lg:left-4 lg:p-4'
              delay={0.5}
            >
              <div className='flex items-center gap-2'>
                <div className='bg-primary/10 flex size-8 items-center justify-center rounded-xl'>
                  <Flame className='text-primary size-4' />
                </div>
                <div>
                  <p className='text-xs font-bold'>520</p>
                  <p className='text-muted-foreground text-[10px]'>消費 kcal</p>
                </div>
              </div>
            </FloatingCard>

            <FloatingCard
              className='bg-card absolute right-0 top-2 z-20 rounded-2xl p-3 shadow-lg lg:right-4 lg:p-4'
              delay={0.6}
            >
              <div className='flex items-center gap-2'>
                <div className='flex size-8 items-center justify-center rounded-xl bg-blue-500/10'>
                  <Footprints className='size-4 text-blue-500' />
                </div>
                <div>
                  <p className='text-xs font-bold'>45 分</p>
                  <p className='text-muted-foreground text-[10px]'>運動時間</p>
                </div>
              </div>
            </FloatingCard>

            <FloatingCard
              className='bg-card absolute bottom-0 left-0 z-20 rounded-2xl p-3 shadow-lg lg:left-4 lg:p-4'
              delay={0.7}
            >
              <div className='flex items-center gap-2'>
                <div className='flex size-8 items-center justify-center rounded-xl bg-amber-500/10'>
                  <Star className='size-4 text-amber-500' />
                </div>
                <div>
                  <p className='text-xs font-bold'>7日連続</p>
                  <p className='text-muted-foreground text-[10px]'>記録継続中</p>
                </div>
              </div>
            </FloatingCard>

            <FloatingCard
              className='bg-card absolute bottom-2 right-0 z-20 rounded-2xl p-3 shadow-lg lg:right-4 lg:p-4'
              delay={0.8}
            >
              <div className='flex items-center gap-2'>
                <div className='bg-primary/10 flex size-8 items-center justify-center rounded-xl'>
                  <Sparkles className='text-primary size-4' />
                </div>
                <div>
                  <p className='text-xs font-bold'>AI 評価</p>
                  <p className='text-muted-foreground text-[10px]'>良いバランス</p>
                </div>
              </div>
            </FloatingCard>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className='border-t px-6 py-12 lg:py-20'>
        <div className='mx-auto max-w-7xl'>
          <m.div
            className='mb-10 text-center'
            initial={init({ opacity: 0, y: 16 })}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className='text-2xl font-bold lg:text-3xl'>主な機能</h2>
            <p className='text-muted-foreground mt-2 text-sm lg:text-base'>
              シンプルな操作で、毎日の健康管理を習慣に
            </p>
          </m.div>
          <div className='grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6'>
            {features.map((feature, i) => (
              <m.div
                key={feature.title}
                className='bg-card rounded-2xl border p-4 transition-shadow hover:shadow-md lg:p-6'
                initial={init({ opacity: 0, y: 16 })}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.1, type: 'spring', stiffness: 300, damping: 24 }}
              >
                <div className='bg-primary/10 mb-3 flex size-10 items-center justify-center rounded-xl lg:size-12'>
                  <feature.icon className='text-primary size-5 lg:size-6' />
                </div>
                <p className='text-sm font-semibold lg:text-base'>{feature.title}</p>
                <p className='text-muted-foreground mt-1 text-xs leading-relaxed lg:text-sm'>{feature.description}</p>
              </m.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='border-t px-6 py-12 text-center lg:py-20'>
        <m.div
          initial={init({ opacity: 0, y: 16 })}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <h2 className='text-xl font-bold lg:text-2xl'>今すぐ始めましょう</h2>
          <p className='text-muted-foreground mt-2 text-sm lg:text-base'>
            無料で使えます。Google アカウントがあればすぐにスタート。
          </p>
          <Button
            size='lg'
            className='mt-6 h-12 gap-3 rounded-full px-8 text-base shadow-lg'
            onClick={handleGoogleSignIn}
            disabled={signing}
          >
            <GoogleIcon />
            {signing ? 'ログイン中...' : 'Google で始める'}
          </Button>
          <p className='text-muted-foreground/60 mt-4 text-xs'>
            ログインすることで{' '}
            <Link href='/terms' className='underline underline-offset-2'>
              利用規約
            </Link>
            と{' '}
            <Link href='/privacy' className='underline underline-offset-2'>
              プライバシーポリシー
            </Link>
            に同意したものとみなします
          </p>
        </m.div>
      </section>
    </div>
  )
}
