'use client'

import { useSuspenseQuery } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { Pencil, Plus } from 'lucide-react'
import { Suspense, useState } from 'react'
import Link from 'vinext/shims/link'
import { DateNav } from '@/components/date-nav'
import { EditMealDialog } from '@/components/edit-meal-dialog'
import { PageHeader } from '@/components/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { api } from '@/lib/api'
import { selectedDateAtom } from '@/lib/atoms'
import type { MealWithFood } from '@/lib/db'
import type { MealType } from '@/lib/schema'
import { mealTypeLabels } from '@/lib/schema'

function MealsPageContent() {
  const date = useAtomValue(selectedDateAtom)
  const [editingMealType, setEditingMealType] = useState<MealType | null>(null)
  const { data: meals } = useSuspenseQuery<MealWithFood[]>({
    queryKey: ['meals', date],
    queryFn: () => api.listMeals({ queries: { date } })
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
      <PageHeader title='食事記録' back>
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
              <div className='mb-2 flex items-center gap-2'>
                <Badge variant='secondary'>{mealTypeLabels[type]}</Badge>
                <Button variant='ghost' size='icon' className='size-7' onClick={() => setEditingMealType(type)}>
                  <Pencil className='size-3.5' />
                </Button>
              </div>
              <div className='space-y-2'>
                {items.map((meal) => (
                  <Card key={meal.id}>
                    <CardContent className='flex items-center justify-between py-3'>
                      <div>
                        <p className='font-medium'>{meal.food_name}</p>
                        <p className='text-muted-foreground text-xs'>
                          {Math.round(meal.food_calories * meal.quantity)}kcal ({'\u00d7'}
                          {meal.quantity})
                        </p>
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
    </div>
  )
}

export default function MealsPage() {
  return (
    <Suspense
      fallback={
        <div className='p-4'>
          <p className='text-muted-foreground py-8 text-center text-sm'>読み込み中...</p>
        </div>
      }
    >
      <MealsPageContent />
    </Suspense>
  )
}
