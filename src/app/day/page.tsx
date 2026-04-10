'use client'

import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { Bot, Copy, Loader2, Pencil, Plus, Sparkles } from 'lucide-react'
import { AnimatePresence } from 'motion/react'
import * as m from 'motion/react-m'
import { Suspense, useState } from 'react'
import { toast } from 'sonner'
import Link from 'vinext/shims/link'
import { AddMealDialog } from '@/components/add-meal-dialog'
import { AiThinkingOverlay } from '@/components/ai-thinking-overlay'
import { DateNav } from '@/components/date-nav'
import { DayFab } from '@/components/day-fab'
import { EditMealDialog } from '@/components/edit-meal-dialog'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { UpdatingOverlay } from '@/components/updating-overlay'
import { api } from '@/lib/api'
import { selectedDateAtom } from '@/lib/atoms'
import type { ExerciseRow, MealWithFood } from '@/lib/db'
import type { MealType } from '@/lib/schema'
import { mealTypeLabels } from '@/lib/schema'
import { useMinPending } from '@/lib/use-min-pending'
import { useSkipAnimation } from '@/lib/use-skip-animation'

const DEFAULT_CALORIE_GOAL = 2000

function DayPageContent() {
  const date = useAtomValue(selectedDateAtom)
  const queryClient = useQueryClient()
  const [dialogType, setDialogType] = useState<MealType | null>(null)
  const [editingMealType, setEditingMealType] = useState<MealType | null>(null)
  const [advice, setAdvice] = useState<string | null>(null)

  const { data: profileData } = useQuery({
    queryKey: ['profile'],
    queryFn: () => api.getProfile(),
    staleTime: Number.POSITIVE_INFINITY
  })
  const calorieGoal = profileData?.profile?.calorieGoal ?? DEFAULT_CALORIE_GOAL

  const { data: meals } = useSuspenseQuery<MealWithFood[]>({
    queryKey: ['meals', date],
    queryFn: () => api.listMeals({ queries: { date } })
  })
  const { data: exercises } = useSuspenseQuery<ExerciseRow[]>({
    queryKey: ['exercises', date],
    queryFn: () => api.listExercises({ queries: { date } })
  })

  const adviceMutation = useMutation({
    mutationFn: () =>
      api.getAdvice({
        meals: meals.map((m) => ({
          food_name: m.food_name,
          calories: m.food_calories,
          meal_type: m.meal_type,
          quantity: m.quantity
        })),
        exercises: exercises.map((e) => ({
          name: e.name,
          duration_min: e.duration_min,
          calories: e.calories
        })),
        date
      }),
    onSuccess: (data) => setAdvice(data.message)
  })

  const copyMutation = useMutation({
    mutationFn: () => {
      const d = new Date(date)
      d.setDate(d.getDate() - 1)
      const yesterday = d.toISOString().slice(0, 10)
      return api.copyMeals({ from_date: yesterday, to_date: date })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meals', date] })
      toast.success('前日の食事をコピーしました')
    }
  })

  const showCopyOverlay = useMinPending(copyMutation.isPending)

  const totalIntake = meals.reduce((s, m) => s + m.food_calories * m.quantity, 0)
  const totalBurn = exercises.reduce((s, e) => s + (e.calories ?? 0), 0)
  const net = totalIntake - totalBurn
  const pct = Math.min((totalIntake / calorieGoal) * 100, 100)
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

  const getMealTypeByTime = (): MealType => {
    const h = new Date().getHours()
    if (h < 10) return 'breakfast'
    if (h < 14) return 'lunch'
    if (h < 17) return 'snack'
    return 'dinner'
  }

  const skipAnimation = useSkipAnimation()
  const stagger = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.07 } }
  }
  const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  } as const

  return (
    <m.div className='space-y-6 p-4' initial={skipAnimation ? false : 'hidden'} animate='visible' variants={stagger}>
      <m.div variants={fadeUp}>
        <PageHeader title='日別記録' />
      </m.div>
      <m.div variants={fadeUp}>
        <DateNav />
      </m.div>

      {/* AI Advice */}
      <m.div variants={fadeUp}>
        {advice ? (
          <Card>
            <CardContent className='py-3'>
              <div className='mb-2 flex items-center gap-1.5'>
                <Sparkles className='text-primary size-3.5' />
                <span className='text-xs font-medium'>AI 評価</span>
              </div>
              <p className='text-sm leading-relaxed'>{advice}</p>
              <Button
                variant='ghost'
                size='sm'
                className='mt-2 h-7 text-xs'
                onClick={() => adviceMutation.mutate()}
                disabled={adviceMutation.isPending}
              >
                {adviceMutation.isPending ? (
                  <Loader2 className='mr-1 size-3 animate-spin' />
                ) : (
                  <Bot className='mr-1 size-3' />
                )}
                再評価
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Button
            variant='outline'
            className='w-full gap-2'
            onClick={() => adviceMutation.mutate()}
            disabled={adviceMutation.isPending}
          >
            {adviceMutation.isPending ? <Loader2 className='size-4 animate-spin' /> : <Sparkles className='size-4' />}
            {adviceMutation.isPending ? '評価中...' : 'AI に今日の記録を評価してもらう'}
          </Button>
        )}
      </m.div>

      {/* Calorie bar */}
      <m.div className='space-y-2' variants={fadeUp}>
        <div className='flex items-end justify-between'>
          <span className='text-3xl font-bold'>{Math.round(totalIntake)}</span>
          <span className='text-muted-foreground text-sm'>/ {calorieGoal} kcal</span>
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
        <div className='mb-3 flex items-center justify-between'>
          <h2 className='text-sm font-bold'>食事</h2>
          <Button
            variant='ghost'
            size='sm'
            className='h-7 text-xs'
            onClick={() => copyMutation.mutate()}
            disabled={copyMutation.isPending}
          >
            <Copy className='mr-1 size-3' />
            前日からコピー
          </Button>
        </div>
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
                    {items.length > 0 ? (
                      <m.button
                        type='button'
                        onClick={() => setEditingMealType(type)}
                        className='text-muted-foreground hover:text-foreground'
                        whileTap={{ scale: 0.85 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                      >
                        <Pencil className='size-3.5' />
                      </m.button>
                    ) : (
                      <m.button
                        type='button'
                        onClick={() => setDialogType(type)}
                        className='text-primary hover:text-primary/80'
                        whileTap={{ scale: 0.8, rotate: 90 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                      >
                        <Plus className='size-4' />
                      </m.button>
                    )}
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
                          <div className='flex w-full items-center justify-between px-2 py-1.5'>
                            <span className='text-sm'>{meal.food_name}</span>
                            <span className='text-muted-foreground text-xs'>
                              {Math.round(meal.food_calories * meal.quantity)} kcal
                            </span>
                          </div>
                        </m.div>
                      ))}
                    </div>
                  ) : (
                    <button
                      type='button'
                      onClick={() => setDialogType(type)}
                      className='text-muted-foreground hover:text-primary flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-xs transition-colors hover:bg-muted'
                    >
                      <Plus className='size-3' />
                      タップして追加
                    </button>
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
              <m.div
                className='py-6 text-center'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <p className='text-muted-foreground mb-2 text-sm'>まだ運動の記録がありません</p>
                <Button asChild size='sm' variant='outline' className='text-xs'>
                  <Link href='/exercises/new'>
                    <Plus className='mr-1 size-3' />
                    運動を記録する
                  </Link>
                </Button>
              </m.div>
            )}
          </div>
        </AnimatePresence>
      </m.div>

      <DayFab defaultMealType={getMealTypeByTime()} onAddMeal={(type) => setDialogType(type)} />

      {dialogType && (
        <AddMealDialog
          open={!!dialogType}
          onOpenChange={(open) => {
            if (!open) setDialogType(null)
          }}
          mealType={dialogType}
          date={date}
        />
      )}
      {editingMealType && (
        <EditMealDialog
          open={!!editingMealType}
          onOpenChange={(open) => {
            if (!open) setEditingMealType(null)
          }}
          meals={grouped[editingMealType] ?? []}
          mealType={editingMealType}
          date={date}
        />
      )}
      <AiThinkingOverlay show={adviceMutation.isPending} />
      <UpdatingOverlay show={showCopyOverlay} message='前日の食事をコピー中...' />
    </m.div>
  )
}

export default function DayPage() {
  return (
    <Suspense
      fallback={
        <div className='p-4'>
          <p className='text-muted-foreground py-8 text-center text-sm'>読み込み中...</p>
        </div>
      }
    >
      <DayPageContent />
    </Suspense>
  )
}
