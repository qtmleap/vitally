'use client'

import dayjs from 'dayjs'
import { useQuery } from '@tanstack/react-query'
import { useSetAtom } from 'jotai'
import { Bot, ChevronLeft, ChevronRight, Flame, Footprints, Plus, RefreshCw, Trophy, Utensils } from 'lucide-react'
import { AnimatePresence } from 'motion/react'
import * as m from 'motion/react-m'
import { useEffect, useState } from 'react'
import { useRouter } from 'vinext/shims/navigation'
import Link from 'vinext/shims/link'

import { api } from '@/lib/api'
import { useVersionCheck } from '@/lib/use-version-check'
import { useSkipAnimation } from '@/lib/use-skip-animation'
import { selectedDateAtom } from '@/lib/atoms'
import { today } from '@/lib/date'
import type { ExerciseRow, MealWithFood } from '@/lib/db'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

const CALORIE_GOAL = 2000
const EXERCISE_GOAL = 30
const RING_SIZE = 88
const RING_STROKE = 7

function Ring({
  pct,
  className,
  label,
  children
}: {
  pct: number
  className: string
  label: string
  children: React.ReactNode
}) {
  const r = (RING_SIZE - RING_STROKE) / 2
  const c = 2 * Math.PI * r
  const offset = c - (Math.min(pct, 100) / 100) * c

  return (
    <div className='relative inline-flex items-center justify-center' style={{ width: RING_SIZE, height: RING_SIZE }}>
      <svg className='-rotate-90' width={RING_SIZE} height={RING_SIZE} role='img' aria-label={label}>
        <circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={r}
          fill='none'
          className='stroke-muted'
          strokeWidth={RING_STROKE}
        />
        <circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={r}
          fill='none'
          strokeWidth={RING_STROKE}
          strokeLinecap='round'
          strokeDasharray={c}
          strokeDashoffset={offset}
          className={cn('transition-all duration-500', className)}
        />
      </svg>
      <div className='absolute inset-0 flex items-center justify-center'>{children}</div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className='space-y-6 p-4'>
      <Skeleton className='h-7 w-32' />
      <Skeleton className='h-[108px] w-full rounded-2xl' />
      <Skeleton className='h-[108px] w-full rounded-2xl' />
      <div className='space-y-3'>
        <Skeleton className='h-5 w-20' />
        <div className='grid grid-cols-7 gap-0.5'>
          {Array.from({ length: 35 }, (_, i) => (
            <Skeleton key={i} className='aspect-square rounded-xl' />
          ))}
        </div>
      </div>
    </div>
  )
}

function EmptyOnboarding({ onGoToDay }: { onGoToDay: () => void }) {
  const steps = [
    {
      icon: Utensils,
      title: '食事を記録する',
      desc: '朝食・昼食・夕食を手軽に記録',
      color: 'bg-primary/10 text-primary'
    },
    {
      icon: Footprints,
      title: '運動を記録する',
      desc: '時間やカロリーをトラッキング',
      color: 'bg-blue-500/10 text-blue-500'
    },
    {
      icon: Trophy,
      title: '目標を達成する',
      desc: '毎日の記録で健康的な習慣に',
      color: 'bg-orange-500/10 text-orange-500'
    }
  ]

  return (
    <m.div
      className='space-y-4'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
    >
      <div className='rounded-2xl border border-dashed p-5 text-center'>
        <p className='text-muted-foreground mb-1 text-sm'>今日はまだ記録がありません</p>
        <p className='text-muted-foreground text-xs'>下の「+」ボタンから始めましょう</p>
      </div>
      <div className='space-y-2'>
        {steps.map((step, i) => (
          <m.button
            key={step.title}
            type='button'
            onClick={onGoToDay}
            className='flex w-full items-center gap-4 rounded-2xl p-4 text-left transition-colors active:bg-muted/60'
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.08, type: 'spring', stiffness: 300, damping: 24 }}
            whileTap={{ scale: 0.97 }}
          >
            <div className={cn('flex size-10 items-center justify-center rounded-xl', step.color)}>
              <step.icon className='size-5' />
            </div>
            <div>
              <p className='text-sm font-semibold'>{step.title}</p>
              <p className='text-muted-foreground text-xs'>{step.desc}</p>
            </div>
          </m.button>
        ))}
      </div>
    </m.div>
  )
}

function StreakBanner({ streak }: { streak: number }) {
  if (streak < 2) return null

  const messages = [
    { min: 2, text: 'いい調子！' },
    { min: 5, text: '素晴らしい継続力！' },
    { min: 10, text: '10日突破！' },
    { min: 30, text: '1ヶ月達成！' }
  ]
  const msg = [...messages].reverse().find((m) => streak >= m.min)?.text ?? 'いい調子！'

  return (
    <m.div
      className='from-orange-500/10 to-amber-500/10 flex items-center gap-3 rounded-2xl bg-gradient-to-r px-4 py-3'
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
    >
      <div className='flex size-10 items-center justify-center rounded-xl bg-orange-500/15'>
        <Flame className='size-5 text-orange-500' />
      </div>
      <div className='flex-1'>
        <p className='text-sm font-bold'>{streak}日連続記録中</p>
        <p className='text-muted-foreground text-xs'>{msg}</p>
      </div>
    </m.div>
  )
}

export function Dashboard() {
  const [now, setNow] = useState('')
  const [calMonth, setCalMonth] = useState<dayjs.Dayjs | null>(null)
  const { hasUpdate, state: updateState, prepare, reload } = useVersionCheck()
  useEffect(() => {
    const t = today()
    setNow(t)
    setCalMonth(dayjs(t).startOf('month'))
  }, [])
  const router = useRouter()
  const setDate = useSetAtom(selectedDateAtom)

  const calMonthStr = calMonth?.format('YYYY-MM') ?? ''

  const { data: meals = [] } = useQuery<MealWithFood[]>({
    queryKey: ['meals', now],
    queryFn: () => api.meals.list(now),
    enabled: !!now
  })
  const { data: exercises = [] } = useQuery<ExerciseRow[]>({
    queryKey: ['exercises', now],
    queryFn: () => api.exercises.list(now),
    enabled: !!now
  })
  const { data: monthSummary = {} } = useQuery({
    queryKey: ['summary', calMonthStr],
    queryFn: () => {
      const m = calMonth!
      const from = m.format('YYYY-MM-DD')
      const to = m.endOf('month').format('YYYY-MM-DD')
      return api.summary.month(from, to)
    },
    enabled: !!calMonth
  })

  const totalIntake = meals.reduce((s, m) => s + m.food_calories * m.quantity, 0)
  const totalBurn = exercises.reduce((s, e) => s + (e.calories ?? 0), 0)
  const totalExMin = exercises.reduce((s, e) => s + e.duration_min, 0)
  const totalProtein = meals.reduce((s, m) => s + m.food_protein * m.quantity, 0)
  const totalFat = meals.reduce((s, m) => s + m.food_fat * m.quantity, 0)
  const totalCarbs = meals.reduce((s, m) => s + m.food_carbs * m.quantity, 0)

  const skipAnimation = useSkipAnimation()

  const calPct = (totalIntake / CALORIE_GOAL) * 100
  const exPct = (totalExMin / EXERCISE_GOAL) * 100
  const calGoalReached = totalIntake > 0 && totalIntake <= CALORIE_GOAL && calPct >= 80
  const exGoalReached = totalExMin >= EXERCISE_GOAL

  if (!now || !calMonth) return <DashboardSkeleton />

  const d = dayjs(now)
  const daysInMonth = calMonth.daysInMonth()
  const startDow = calMonth.day()

  const goToDay = (date: string) => {
    setDate(date)
    router.push('/day')
  }

  const prevMonth = () => setCalMonth((m) => m!.subtract(1, 'month'))
  const nextMonth = () => {
    if (calMonth.isBefore(d, 'month')) setCalMonth((m) => m!.add(1, 'month'))
  }
  const hasMeals = meals.length > 0
  const hasExercises = exercises.length > 0
  const hasAnyData = hasMeals || hasExercises

  const streak = (() => {
    const yesterday = d.subtract(1, 'day').format('YYYY-MM-DD')
    const hasToday = monthSummary[now]?.calories > 0
    const hasYesterday = monthSummary[yesterday]?.calories > 0
    if (!hasToday && !hasYesterday) return 0
    let count = 0
    let cursor = hasToday ? d : d.subtract(1, 'day')
    while (true) {
      const key = cursor.format('YYYY-MM-DD')
      if (monthSummary[key]?.calories > 0) {
        count++
        cursor = cursor.subtract(1, 'day')
      } else {
        break
      }
    }
    return count
  })()

  const weekStats = (() => {
    const startOfWeek = d.startOf('week').add(1, 'day')
    const days: string[] = []
    for (let i = 0; i < 7; i++) {
      const day = startOfWeek.add(i, 'day')
      if (!day.isAfter(d, 'day')) {
        days.push(day.format('YYYY-MM-DD'))
      }
    }
    const activeDays = days.filter((k) => monthSummary[k])
    if (activeDays.length === 0) return null
    const totalCal = activeDays.reduce((s, k) => s + (monthSummary[k]?.calories ?? 0), 0)
    const avgCal = Math.round(totalCal / activeDays.length)
    const exerciseDays = activeDays.filter((k) => (monthSummary[k]?.exercise_min ?? 0) > 0).length
    const bestDay = activeDays
      .filter((k) => (monthSummary[k]?.calories ?? 0) <= CALORIE_GOAL && (monthSummary[k]?.calories ?? 0) > 0)
      .sort((a, b) => (monthSummary[b]?.calories ?? 0) - (monthSummary[a]?.calories ?? 0))[0]
    return {
      avgCal,
      exerciseDays,
      bestDay: bestDay ? dayjs(bestDay).format('M/D') : null
    }
  })()

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.97 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { delay: i * 0.1, type: 'spring' as const, stiffness: 300, damping: 24 }
    })
  }

  return (
    <m.div className='p-4 lg:p-6' initial={skipAnimation ? false : 'hidden'} animate='visible'>
      {/* Header - full width */}
      <m.div
        className='flex items-center justify-between'
        initial={skipAnimation ? false : { opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      >
        <h1 className='text-xl font-bold lg:text-2xl'>Vitally</h1>
        <span className='text-muted-foreground text-xs'>{d.format('M月D日 (dd)')}</span>
      </m.div>

      {/* Update banner - full width */}
      {hasUpdate && updateState === 'idle' && (
        <m.button
          type='button'
          onClick={prepare}
          className='mt-5 flex w-full items-center gap-3 rounded-2xl bg-blue-500/10 px-4 py-3 text-left transition-colors active:bg-blue-500/20'
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        >
          <div className='flex size-10 items-center justify-center rounded-xl bg-blue-500/15'>
            <RefreshCw className='size-5 text-blue-500' />
          </div>
          <div className='flex-1'>
            <p className='text-sm font-bold'>アップデートがあります</p>
            <p className='text-muted-foreground text-xs'>タップして最新版に更新</p>
          </div>
        </m.button>
      )}

      {/* Updating overlay */}
      <AnimatePresence>
        {updateState !== 'idle' && (
          <m.div
            className='fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <m.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className='flex flex-col items-center gap-4'
            >
              <m.div
                animate={updateState === 'preparing' ? { rotate: 360 } : { rotate: 0 }}
                transition={updateState === 'preparing' ? { duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: 'linear' } : {}}
              >
                <RefreshCw className='size-8 text-white' />
              </m.div>
              <p className='text-sm font-medium text-white'>
                {updateState === 'preparing' ? 'アップデートしています...' : 'アップデート完了'}
              </p>
              <div className='h-1 w-48 overflow-hidden rounded-full bg-white/20'>
                <m.div
                  className='h-full rounded-full bg-white'
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2, ease: [0.4, 0, 0.2, 1] }}
                />
              </div>
              {updateState === 'ready' && (
                <m.button
                  type='button'
                  onClick={reload}
                  className='mt-2 rounded-full bg-blue-500 px-6 py-2 text-sm font-bold text-white transition-colors active:bg-blue-600'
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                >
                  再読み込み
                </m.button>
              )}
            </m.div>
          </m.div>
        )}
      </AnimatePresence>

      {/* Main grid */}
      <div className='mt-5 lg:grid lg:grid-cols-5 lg:gap-6'>
        {/* Left column */}
        <div className='space-y-5 lg:col-span-3'>
          <StreakBanner streak={streak} />

          {!hasAnyData ? (
            <EmptyOnboarding onGoToDay={() => goToDay(now)} />
          ) : (
            <>
              {(calGoalReached || exGoalReached) && (
                <m.div className='flex flex-wrap gap-2' variants={cardVariants} custom={0.5}>
                  {calGoalReached && (
                    <div className='bg-primary/10 text-primary flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium'>
                      <Trophy className='size-3' />
                      カロリー目標達成
                    </div>
                  )}
                  {exGoalReached && (
                    <div className='flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-500'>
                      <Trophy className='size-3' />
                      運動目標達成
                    </div>
                  )}
                </m.div>
              )}

              <m.button
                type='button'
                onClick={() => goToDay(now)}
                className='w-full text-left'
                variants={cardVariants}
                custom={1}
                whileTap={{ scale: 0.97 }}
                aria-label='今日のカロリー詳細を見る'
              >
                <div className='bg-muted/50 flex items-center gap-5 rounded-2xl p-5 lg:p-6'>
                  <Ring pct={calPct} className='stroke-primary' label={`カロリー達成率 ${Math.round(calPct)}%`}>
                    <Flame className='text-primary size-5' />
                  </Ring>
                  <div className='flex-1 space-y-1'>
                    <p className='text-muted-foreground text-xs font-medium uppercase tracking-wider'>今日のカロリー</p>
                    {hasMeals ? (
                      <>
                        <p className='text-2xl font-bold'>
                          {Math.round(totalIntake)}{' '}
                          <span className='text-muted-foreground text-sm font-normal'>/ {CALORIE_GOAL}</span>
                        </p>
                        <div className='text-muted-foreground flex gap-3 text-xs'>
                          <span>消費 {Math.round(totalBurn)}</span>
                          <span>P {Math.round(totalProtein)}g</span>
                          <span>F {Math.round(totalFat)}g</span>
                          <span>C {Math.round(totalCarbs)}g</span>
                        </div>
                      </>
                    ) : (
                      <p className='text-muted-foreground flex items-center gap-1 text-sm'>
                        <Plus className='size-4' />
                        食事を記録しましょう
                      </p>
                    )}
                  </div>
                </div>
              </m.button>

              <m.button
                type='button'
                onClick={() => goToDay(now)}
                className='w-full text-left'
                variants={cardVariants}
                custom={2}
                whileTap={{ scale: 0.97 }}
                aria-label='今日の運動詳細を見る'
              >
                <div className='bg-muted/50 flex items-center gap-5 rounded-2xl p-5 lg:p-6'>
                  <Ring pct={exPct} className='stroke-blue-500' label={`運動達成率 ${Math.round(exPct)}%`}>
                    <Footprints className='size-5 text-blue-500' />
                  </Ring>
                  <div className='flex-1 space-y-1'>
                    <p className='text-muted-foreground text-xs font-medium uppercase tracking-wider'>今日の運動</p>
                    {hasExercises ? (
                      <p className='text-2xl font-bold'>
                        {totalExMin}{' '}
                        <span className='text-muted-foreground text-sm font-normal'>/ {EXERCISE_GOAL} 分</span>
                      </p>
                    ) : (
                      <p className='text-muted-foreground flex items-center gap-1 text-sm'>
                        <Plus className='size-4' />
                        運動を記録しましょう
                      </p>
                    )}
                  </div>
                </div>
              </m.button>
            </>
          )}

          {/* AI Advice teaser */}
          <m.div variants={cardVariants} custom={2.5}>
            <Link
              href='/ai'
              className='from-violet-500/10 to-blue-500/10 flex items-center gap-4 rounded-2xl bg-gradient-to-r p-4 transition-colors active:opacity-80'
            >
              <div className='flex size-10 items-center justify-center rounded-xl bg-violet-500/15'>
                <Bot className='size-5 text-violet-500' />
              </div>
              <div className='flex-1'>
                <p className='text-sm font-semibold'>AI アドバイス</p>
                <p className='text-muted-foreground text-xs'>今日の食事・運動をAIが分析</p>
              </div>
              <ChevronRight className='text-muted-foreground size-4' />
            </Link>
          </m.div>
        </div>

        {/* Right column */}
        <div className='mt-5 space-y-5 lg:col-span-2 lg:mt-0'>
          {/* Calendar */}
          <m.div variants={cardVariants} custom={3}>
            <div className='mb-3 flex items-center justify-between'>
              <button
                type='button'
                onClick={prevMonth}
                className='text-muted-foreground hover:text-foreground rounded-lg p-1.5 transition-colors'
                aria-label='前月'
              >
                <ChevronLeft className='size-4' />
              </button>
              <p className='text-sm font-bold'>{calMonth.format('YYYY年M月')}</p>
              <button
                type='button'
                onClick={nextMonth}
                disabled={!calMonth.isBefore(d, 'month')}
                className='text-muted-foreground hover:text-foreground rounded-lg p-1.5 transition-colors disabled:opacity-30'
                aria-label='次月'
              >
                <ChevronRight className='size-4' />
              </button>
            </div>
            <div className='grid grid-cols-7 gap-0.5 text-center text-sm'>
              {['日', '月', '火', '水', '木', '金', '土'].map((day) => (
                <span key={day} className='text-muted-foreground pb-2 text-sm font-medium lg:text-base'>
                  {day}
                </span>
              ))}
              {Array.from({ length: startDow }, (_, i) => (
                <span key={`e-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const date = calMonth.add(i, 'day').format('YYYY-MM-DD')
                const isToday = date === now
                const isFuture = dayjs(date).isAfter(d, 'day')
                const daySummary = monthSummary[date]
                const calOk = daySummary && daySummary.calories > 0 && daySummary.calories <= CALORIE_GOAL
                const exOk = daySummary && daySummary.exercise_min >= EXERCISE_GOAL
                return (
                  <m.button
                    type='button'
                    key={date}
                    onClick={() => goToDay(date)}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    suppressHydrationWarning
                    className={cn(
                      'relative flex flex-col items-center justify-center aspect-square rounded-xl text-sm transition-colors lg:text-base',
                      isToday && 'bg-primary text-primary-foreground font-bold shadow-sm',
                      !isToday && isFuture && 'text-muted-foreground/40',
                      !isToday && !isFuture && 'hover:bg-muted'
                    )}
                  >
                    {i + 1}
                    {(calOk || exOk) && (
                      <span className='absolute bottom-0.5 flex gap-0.5'>
                        {calOk && (
                          <span
                            className={cn('size-1 rounded-full', isToday ? 'bg-primary-foreground' : 'bg-primary')}
                          />
                        )}
                        {exOk && (
                          <span
                            className={cn('size-1 rounded-full', isToday ? 'bg-primary-foreground' : 'bg-blue-500')}
                          />
                        )}
                      </span>
                    )}
                  </m.button>
                )
              })}
            </div>
          </m.div>

          {/* Weekly summary */}
          {weekStats && (
            <m.div className='bg-muted/50 rounded-2xl p-4' variants={cardVariants} custom={4}>
              <p className='text-muted-foreground mb-3 text-xs font-medium uppercase tracking-wider'>今週のまとめ</p>
              <div className='grid grid-cols-3 gap-3 text-center'>
                <div>
                  <p className='text-lg font-bold'>{weekStats.avgCal}</p>
                  <p className='text-muted-foreground text-[10px]'>平均 kcal</p>
                </div>
                <div>
                  <p className='text-lg font-bold'>{weekStats.exerciseDays}日</p>
                  <p className='text-muted-foreground text-[10px]'>運動した日</p>
                </div>
                <div>
                  <p className='text-lg font-bold'>{weekStats.bestDay || '-'}</p>
                  <p className='text-muted-foreground text-[10px]'>ベストの日</p>
                </div>
              </div>
            </m.div>
          )}
        </div>
      </div>
    </m.div>
  )
}
