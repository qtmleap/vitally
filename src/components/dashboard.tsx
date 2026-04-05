'use client'

import dayjs from 'dayjs'
import { useQuery } from '@tanstack/react-query'
import { useSetAtom } from 'jotai'
import { Flame, Footprints } from 'lucide-react'
import * as m from 'motion/react-m'
import { useRouter } from 'vinext/shims/navigation'

import { api } from '@/lib/api'
import { selectedDateAtom } from '@/lib/atoms'
import { today } from '@/lib/date'
import type { ExerciseRow, MealWithFood } from '@/lib/db'

const CALORIE_GOAL = 2000
const EXERCISE_GOAL = 30
const RING_SIZE = 88
const RING_STROKE = 7

function Ring({ pct, color, children }: { pct: number; color: string; children: React.ReactNode }) {
  const r = (RING_SIZE - RING_STROKE) / 2
  const c = 2 * Math.PI * r
  const offset = c - (Math.min(pct, 100) / 100) * c

  return (
    <div className='relative inline-flex items-center justify-center' style={{ width: RING_SIZE, height: RING_SIZE }}>
      <svg className='-rotate-90' width={RING_SIZE} height={RING_SIZE}>
        <circle cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={r} fill='none' className='stroke-muted' strokeWidth={RING_STROKE} />
        <circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={r}
          fill='none'
          stroke={color}
          strokeWidth={RING_STROKE}
          strokeLinecap='round'
          strokeDasharray={c}
          strokeDashoffset={offset}
          className='transition-all duration-500'
        />
      </svg>
      <div className='absolute inset-0 flex items-center justify-center'>{children}</div>
    </div>
  )
}

export function Dashboard() {
  const now = today()
  const router = useRouter()
  const setDate = useSetAtom(selectedDateAtom)

  const { data: meals = [] } = useQuery<MealWithFood[]>({
    queryKey: ['meals', now],
    queryFn: () => api.meals.list(now)
  })
  const { data: exercises = [] } = useQuery<ExerciseRow[]>({
    queryKey: ['exercises', now],
    queryFn: () => api.exercises.list(now)
  })

  const totalIntake = meals.reduce((s, m) => s + m.food_calories * m.quantity, 0)
  const totalBurn = exercises.reduce((s, e) => s + (e.calories ?? 0), 0)
  const totalExMin = exercises.reduce((s, e) => s + e.duration_min, 0)
  const totalProtein = meals.reduce((s, m) => s + m.food_protein * m.quantity, 0)
  const totalFat = meals.reduce((s, m) => s + m.food_fat * m.quantity, 0)
  const totalCarbs = meals.reduce((s, m) => s + m.food_carbs * m.quantity, 0)

  const calPct = (totalIntake / CALORIE_GOAL) * 100
  const exPct = (totalExMin / EXERCISE_GOAL) * 100

  const d = dayjs(now)
  const startOfMonth = d.startOf('month')
  const daysInMonth = d.daysInMonth()
  const startDow = startOfMonth.day()

  const goToDay = (date: string) => {
    setDate(date)
    router.push('/day')
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.97 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { delay: i * 0.1, type: 'spring', stiffness: 300, damping: 24 }
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

      {/* Today summary */}
      <m.button
        type='button'
        onClick={() => goToDay(now)}
        className='w-full text-left'
        variants={cardVariants}
        custom={0}
        whileTap={{ scale: 0.97 }}
      >
        <div className='bg-muted/50 flex items-center gap-5 rounded-2xl p-5'>
          <Ring pct={calPct} color='oklch(0.55 0.2 145)'>
            <Flame className='text-primary size-5' />
          </Ring>
          <div className='flex-1 space-y-1'>
            <p className='text-muted-foreground text-xs font-medium uppercase tracking-wider'>今日のカロリー</p>
            <p className='text-2xl font-bold'>{Math.round(totalIntake)} <span className='text-muted-foreground text-sm font-normal'>/ {CALORIE_GOAL}</span></p>
            <div className='text-muted-foreground flex gap-3 text-xs'>
              <span>消費 {Math.round(totalBurn)}</span>
              <span>P {Math.round(totalProtein)}g</span>
              <span>F {Math.round(totalFat)}g</span>
              <span>C {Math.round(totalCarbs)}g</span>
            </div>
          </div>
        </div>
      </m.button>

      <m.button
        type='button'
        onClick={() => goToDay(now)}
        className='w-full text-left'
        variants={cardVariants}
        custom={1}
        whileTap={{ scale: 0.97 }}
      >
        <div className='bg-muted/50 flex items-center gap-5 rounded-2xl p-5'>
          <Ring pct={exPct} color='oklch(0.55 0.2 250)'>
            <Footprints className='size-5 text-blue-500' />
          </Ring>
          <div className='flex-1 space-y-1'>
            <p className='text-muted-foreground text-xs font-medium uppercase tracking-wider'>今日の運動</p>
            <p className='text-2xl font-bold'>{totalExMin} <span className='text-muted-foreground text-sm font-normal'>/ {EXERCISE_GOAL} 分</span></p>
          </div>
        </div>
      </m.button>

      {/* Calendar */}
      <m.div variants={cardVariants} custom={2}>
        <p className='mb-3 text-sm font-bold'>{d.format('YYYY年M月')}</p>
        <div className='grid grid-cols-7 gap-0.5 text-center text-xs'>
          {['日', '月', '火', '水', '木', '金', '土'].map((day) => (
            <span key={day} className='text-muted-foreground pb-2 text-[10px] font-medium'>
              {day}
            </span>
          ))}
          {Array.from({ length: startDow }, (_, i) => (
            <span key={`e-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const date = startOfMonth.add(i, 'day').format('YYYY-MM-DD')
            const isToday = date === now
            const isFuture = dayjs(date).isAfter(d, 'day')
            return (
              <m.button
                type='button'
                key={date}
                onClick={() => goToDay(date)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                className={`aspect-square rounded-xl text-xs transition-colors ${
                  isToday
                    ? 'bg-primary text-primary-foreground font-bold shadow-sm'
                    : isFuture
                      ? 'text-muted-foreground/40'
                      : 'hover:bg-muted'
                }`}
              >
                {i + 1}
              </m.button>
            )
          })}
        </div>
      </m.div>
    </m.div>
  )
}
