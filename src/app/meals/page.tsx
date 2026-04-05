'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import Link from 'vinext/shims/link'
import { DateNav } from '@/components/date-nav'
import { PageHeader } from '@/components/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { api } from '@/lib/api'
import { selectedDateAtom } from '@/lib/atoms'
import type { MealWithFood } from '@/lib/db'
import type { MealType } from '@/lib/schema'
import { mealTypeLabels } from '@/lib/schema'

export default function MealsPage() {
  const date = useAtomValue(selectedDateAtom)
  const queryClient = useQueryClient()
  const { data: meals = [] } = useQuery<MealWithFood[]>({
    queryKey: ['meals', date],
    queryFn: () => api.meals.list(date)
  })
  const deleteMutation = useMutation({
    mutationFn: api.meals.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['meals', date] })
  })

  const grouped = meals.reduce(
    (acc, meal) => {
      const type = meal.meal_type as MealType
      if (!acc[type]) acc[type] = []
      acc[type].push(meal)
      return acc
    },
    {} as Record<MealType, MealWithFood[]>
  )

  return (
    <div className='p-4'>
      <PageHeader title='食事記録'>
        <Button asChild size='sm'>
          <Link href='/meals/new'>
            <Plus className='mr-1 size-4' />
            追加
          </Link>
        </Button>
      </PageHeader>
      <DateNav />
      <div className='mt-4 space-y-4'>
        {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((type) => {
          const items = grouped[type]
          if (!items?.length) return null
          return (
            <div key={type}>
              <Badge variant='secondary' className='mb-2'>
                {mealTypeLabels[type]}
              </Badge>
              <div className='space-y-2'>
                {items.map((meal) => (
                  <Card key={meal.id}>
                    <CardContent className='flex items-center justify-between py-3'>
                      <div>
                        <p className='font-medium'>{meal.food_name}</p>
                        <p className='text-muted-foreground text-xs'>
                          {Math.round(meal.food_calories * meal.quantity)}kcal (×{meal.quantity})
                        </p>
                      </div>
                      <div className='flex'>
                        <Button variant='ghost' size='icon' asChild>
                          <Link href={`/meals/${meal.id}/edit`}>
                            <Pencil className='size-4' />
                          </Link>
                        </Button>
                        <Button variant='ghost' size='icon' onClick={() => deleteMutation.mutate(meal.id)}>
                          <Trash2 className='size-4 text-destructive' />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )
        })}
        {meals.length === 0 && (
          <p className='text-muted-foreground py-8 text-center text-sm'>この日の食事記録はありません</p>
        )}
      </div>
    </div>
  )
}
