'use client'

import { useQuery } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'

import { DateNav } from '@/components/date-nav'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { api } from '@/lib/api'
import { selectedDateAtom } from '@/lib/atoms'
import type { ExerciseRow, MealWithFood } from '@/lib/db'

const CALORIE_GOAL = 2000

export function Dashboard() {
  const date = useAtomValue(selectedDateAtom)
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
  const totalExMin = exercises.reduce((s, e) => s + e.duration_min, 0)
  const net = totalIntake - totalBurn
  const pct = Math.min((totalIntake / CALORIE_GOAL) * 100, 100)

  const totalProtein = meals.reduce((s, m) => s + m.food_protein * m.quantity, 0)
  const totalFat = meals.reduce((s, m) => s + m.food_fat * m.quantity, 0)
  const totalCarbs = meals.reduce((s, m) => s + m.food_carbs * m.quantity, 0)

  return (
    <div className='p-4'>
      <h1 className='mb-4 text-xl font-bold'>HealthLog</h1>
      <DateNav />
      <div className='mt-4 space-y-4'>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>カロリー</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='mb-2 flex items-end justify-between'>
              <span className='text-2xl font-bold'>{Math.round(totalIntake)}</span>
              <span className='text-muted-foreground text-sm'>/ {CALORIE_GOAL} kcal</span>
            </div>
            <Progress value={pct} className='h-2' />
            <div className='text-muted-foreground mt-2 flex justify-between text-xs'>
              <span>摂取: {Math.round(totalIntake)} kcal</span>
              <span>消費: {Math.round(totalBurn)} kcal</span>
              <span>差引: {Math.round(net)} kcal</span>
            </div>
          </CardContent>
        </Card>

        <div className='grid grid-cols-3 gap-2'>
          <Card>
            <CardContent className='py-3 text-center'>
              <p className='text-muted-foreground text-xs'>タンパク質</p>
              <p className='text-lg font-bold'>{Math.round(totalProtein)}g</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='py-3 text-center'>
              <p className='text-muted-foreground text-xs'>脂質</p>
              <p className='text-lg font-bold'>{Math.round(totalFat)}g</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='py-3 text-center'>
              <p className='text-muted-foreground text-xs'>炭水化物</p>
              <p className='text-lg font-bold'>{Math.round(totalCarbs)}g</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className='py-3'>
            <div className='flex items-center justify-between'>
              <span className='text-sm'>運動時間</span>
              <span className='font-bold'>{totalExMin}分</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
