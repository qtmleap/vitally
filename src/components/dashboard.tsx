'use client'

import dayjs from 'dayjs'
import { useQuery } from '@tanstack/react-query'
import { useSetAtom } from 'jotai'
import { ChevronLeft, ChevronRight, Flame, Footprints, Plus } from 'lucide-react'
import * as m from 'motion/react-m'
import { useEffect, useState } from 'react'
import { useRouter } from 'vinext/shims/navigation'

import { api } from '@/lib/api'
import { selectedDateAtom } from '@/lib/atoms'
import { today } from '@/lib/date'
import type { ExerciseRow, MealWithFood } from '@/lib/db'
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
      <svg
        className='-rotate-90'
        width={RING_SIZE}
        height={RING_SIZE}
        role='img'
        aria-label={label}
      >
        <circle cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={r} fill='none' className='stroke-muted' strokeWidth={RING_STROKE} />
        <circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={r}
          fill='none'
          strokeWidth={RING_STROKE}
          strokeLinecap='round'
          strokeDasharray={c}
          strokeDashoffset={offset}
          className={`transition-all duration-500 ${className}`}
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

export function Dashboard() {
  const [now, setNow] = useState('')
  const [calMonth, setCalMonth] = useState<dayjs.Dayjs | null>(null)
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

  const calPct = (totalIntake / CALORIE_GOAL) * 100
  const exPct = (totalExMin / EXERCISE_GOAL) * 100

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
    <m.div className='space-y-6 p-4' initial='hidden' animate='visible'>
      <m.h1
        className='text-xl font-bold'
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      >
        HealthLog
      </m.h1>

      {/* Today summary — Calories */}
      <m.button
        type='button'
        onClick={() => goToDay(now)}
        className='w-full text-left'
        variants={cardVariants}
        custom={0}
        whileTap={{ scale: 0.97 }}
        aria-label='今日のカロリー詳細を見る'
      >
        <div className='bg-muted/50 flex items-center gap-5 rounded-2xl p-5'>
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

      {/* Today summary — Exercise */}
      <m.button
        type='button'
        onClick={() => goToDay(now)}
        className='w-full text-left'
        variants={cardVariants}
        custom={1}
        whileTap={{ scale: 0.97 }}
        aria-label='今日の運動詳細を見る'
      >
        <div className='bg-muted/50 flex items-center gap-5 rounded-2xl p-5'>
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

      {/* Calendar */}
      <m.div variants={cardVariants} custom={2}>
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
            <span key={day} className='text-muted-foreground pb-2 text-sm font-medium'>
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
                className={`relative flex flex-col items-center justify-center aspect-square rounded-xl text-sm transition-colors ${
                  isToday
                    ? 'bg-primary text-primary-foreground font-bold shadow-sm'
                    : isFuture
                      ? 'text-muted-foreground/40'
                      : 'hover:bg-muted'
                }`}
              >
                {i + 1}
                {(calOk || exOk) && (
                  <span className='flex gap-0.5 absolute bottom-0.5'>
                    {calOk && (
                      <span
                        className={`size-1 rounded-full ${isToday ? 'bg-primary-foreground' : 'bg-primary'}`}
                      />
                    )}
                    {exOk && (
                      <span
                        className={`size-1 rounded-full ${isToday ? 'bg-primary-foreground' : 'bg-blue-500'}`}
                      />
                    )}
                  </span>
                )}
              </m.button>
            )
          })}
        </div>
      </m.div>
    </m.div>
  )
}
