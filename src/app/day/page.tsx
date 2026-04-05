'use client'

import { useQuery } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { Plus } from 'lucide-react'
import { AnimatePresence } from 'motion/react'
import * as m from 'motion/react-m'
import Link from 'vinext/shims/link'
import { useState } from 'react'

import { AddMealDialog } from '@/components/add-meal-dialog'
import { DateNav } from '@/components/date-nav'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import { selectedDateAtom } from '@/lib/atoms'
import type { ExerciseRow, MealWithFood } from '@/lib/db'
import type { MealType } from '@/lib/schema'
import { mealTypeLabels } from '@/lib/schema'

const CALORIE_GOAL = 2000

export default function DayPage() {
  const date = useAtomValue(selectedDateAtom)
  const [dialogType, setDialogType] = useState<MealType | null>(null)

  const { data: meals = [] } = useQuery<MealWithFood[]>({
    queryKey: ['meals', date],
    queryFn: () => api.meals.list(date)
  })
  const { data: exercises = [] } = useQuery<ExerciseRow[]>({
    queryKey: ['exercises', date],
    queryFn: () => api.exercises.list(date)
  })

  const totalIntake = meals.reduce((s, m) => s + m.food_calories * m.quantity, 0)
  const totalBurn = exercises.reduce((s, e) => s + (e.calories ?? 0), 0)
  const net = totalIntake - totalBurn
  const pct = Math.min((totalIntake / CALORIE_GOAL) * 100, 100)
  const totalProtein = meals.reduce((s, m) => s + m.food_protein * m.quantity, 0)
  const totalFat = meals.reduce((s, m) => s + m.food_fat * m.quantity, 0)
  const totalCarbs = meals.reduce((s, m) => s + m.food_carbs * m.quantity, 0)

  const grouped = meals.reduce(
    (acc, meal) => {
      const type = meal.meal_type as MealType
      if (!acc[type]) acc[type] = []
      acc[type].push(meal)
      return acc
    },
    {} as Record<MealType, MealWithFood[]>
  )

  const stagger = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.07 } }
  }
  const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  }

  return (
    <m.div className='space-y-6 p-4' initial='hidden' animate='visible' variants={stagger}>
      <m.div variants={fadeUp}>
        <PageHeader title='日別記録' />
      </m.div>
      <m.div variants={fadeUp}>
        <DateNav />
      </m.div>

      {/* Calorie bar */}
      <m.div className='space-y-2' variants={fadeUp}>
        <div className='flex items-end justify-between'>
          <span className='text-3xl font-bold'>{Math.round(totalIntake)}</span>
          <span className='text-muted-foreground text-sm'>/ {CALORIE_GOAL} kcal</span>
        </div>
        <div className='bg-muted h-2 overflow-hidden rounded-full'>
          <m.div
            className='bg-primary h-full rounded-full'
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1], delay: 0.3 }}
          />
        </div>
        <div className='text-muted-foreground flex justify-between text-xs'>
          <span>消費 {Math.round(totalBurn)}</span>
          <span>差引 {Math.round(net)}</span>
        </div>
      </m.div>

      {/* Macros */}
      <m.div className='grid grid-cols-3 gap-3' variants={fadeUp}>
        {[
          { label: 'タンパク質', value: totalProtein },
          { label: '脂質', value: totalFat },
          { label: '炭水化物', value: totalCarbs }
        ].map(({ label, value }, i) => (
          <m.div
            key={label}
            className='bg-muted/50 rounded-xl p-3 text-center'
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + i * 0.08, type: 'spring', stiffness: 400, damping: 20 }}
          >
            <p className='text-muted-foreground text-[10px]'>{label}</p>
            <p className='mt-0.5 text-lg font-bold'>{Math.round(value)}g</p>
          </m.div>
        ))}
      </m.div>

      {/* Meals */}
      <m.div variants={fadeUp}>
        <h2 className='mb-3 text-sm font-bold'>食事</h2>
        <div className='space-y-3'>
          {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((type, idx) => {
            const items = grouped[type] ?? []
            const subtotal = items.reduce((s, meal) => s + meal.food_calories * meal.quantity, 0)
            return (
              <m.div
                key={type}
                className='bg-muted/50 rounded-xl p-3'
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + idx * 0.08, type: 'spring', stiffness: 300, damping: 24 }}
              >
                <div className='mb-2 flex items-center justify-between'>
                  <span className='text-sm font-medium'>{mealTypeLabels[type]}</span>
                  <div className='flex items-center gap-2'>
                    {items.length > 0 && (
                      <span className='text-muted-foreground text-xs'>{Math.round(subtotal)} kcal</span>
                    )}
                    <m.button
                      type='button'
                      onClick={() => setDialogType(type)}
                      className='text-primary hover:text-primary/80'
                      whileTap={{ scale: 0.8, rotate: 90 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                    >
                      <Plus className='size-4' />
                    </m.button>
                  </div>
                </div>
                <AnimatePresence mode='popLayout'>
                  {items.length > 0 ? (
                    <div className='space-y-1'>
                      {items.map((meal) => (
                        <m.div
                          key={meal.id}
                          layout
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <Link href={`/meals/${meal.id}/edit`} className='flex items-center justify-between rounded-lg px-2 py-1.5 transition-colors hover:bg-muted'>
                            <span className='text-sm'>{meal.food_name}</span>
                            <span className='text-muted-foreground text-xs'>
                              {Math.round(meal.food_calories * meal.quantity)} kcal
                            </span>
                          </Link>
                        </m.div>
                      ))}
                    </div>
                  ) : (
                    <p className='text-muted-foreground text-xs'>未入力</p>
                  )}
                </AnimatePresence>
              </m.div>
            )
          })}
        </div>
      </m.div>

      {/* Exercises */}
      <m.div variants={fadeUp}>
        <div className='mb-3 flex items-center justify-between'>
          <h2 className='text-sm font-bold'>運動</h2>
          <Button asChild size='sm' variant='ghost' className='h-7 text-xs'>
            <Link href='/exercises/new'>
              <Plus className='mr-1 size-3' />
              追加
            </Link>
          </Button>
        </div>
        <AnimatePresence mode='popLayout'>
          <div className='space-y-1.5'>
            {exercises.map((ex, i) => (
              <m.div
                key={ex.id}
                className='flex items-center justify-between rounded-xl px-3 py-2.5'
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: i * 0.05, type: 'spring', stiffness: 300, damping: 24 }}
                layout
              >
                <div>
                  <p className='text-sm font-medium'>{ex.name}</p>
                  <p className='text-muted-foreground text-xs'>
                    {ex.duration_min}分{ex.calories ? ` / ${ex.calories} kcal` : ''}
                  </p>
                </div>
              </m.div>
            ))}
            {exercises.length === 0 && (
              <m.p
                className='text-muted-foreground py-6 text-center text-sm'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                運動記録なし
              </m.p>
            )}
          </div>
        </AnimatePresence>
      </m.div>

      {dialogType && (
        <AddMealDialog
          open={!!dialogType}
          onOpenChange={(open) => { if (!open) setDialogType(null) }}
          mealType={dialogType}
          date={date}
        />
      )}
    </m.div>
  )
}
