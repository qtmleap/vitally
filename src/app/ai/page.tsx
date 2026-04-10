'use client'

import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { Bot, Loader2 } from 'lucide-react'
import { Suspense, useState } from 'react'
import { DateNav } from '@/components/date-nav'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { api } from '@/lib/api'
import { selectedDateAtom } from '@/lib/atoms'
import type { ExerciseRow, MealWithFood } from '@/lib/db'

function AiPageContent() {
  const date = useAtomValue(selectedDateAtom)
  const [advice, setAdvice] = useState<string | null>(null)

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

  return (
    <div className='p-4'>
      <PageHeader title='AI アドバイス' back />
      <DateNav />
      <div className='mt-4 space-y-4'>
        <Button className='w-full' onClick={() => adviceMutation.mutate()} disabled={adviceMutation.isPending}>
          {adviceMutation.isPending ? (
            <Loader2 className='mr-2 size-4 animate-spin' />
          ) : (
            <Bot className='mr-2 size-4' />
          )}
          アドバイスをもらう
        </Button>
        {advice && (
          <Card>
            <CardContent className='prose prose-sm py-4'>
              <p>{advice}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default function AiPage() {
  return (
    <Suspense
      fallback={
        <div className='p-4'>
          <p className='text-muted-foreground py-8 text-center text-sm'>読み込み中...</p>
        </div>
      }
    >
      <AiPageContent />
    </Suspense>
  )
}
