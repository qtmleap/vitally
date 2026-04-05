'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2 } from 'lucide-react'
import Link from 'vinext/shims/link'

import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { api } from '@/lib/api'
import type { FoodRow } from '@/lib/db'

export default function FoodsPage() {
  const queryClient = useQueryClient()
  const { data: foods = [] } = useQuery<FoodRow[]>({
    queryKey: ['foods'],
    queryFn: () => api.foods.list()
  })
  const deleteMutation = useMutation({
    mutationFn: api.foods.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['foods'] })
  })

  return (
    <div className='p-4'>
      <PageHeader title='食品一覧'>
        <Button asChild size='sm'>
          <Link href='/foods/new'>
            <Plus className='mr-1 size-4' />
            追加
          </Link>
        </Button>
      </PageHeader>
      <div className='space-y-2'>
        {foods.map((food) => (
          <Card key={food.id}>
            <CardContent className='flex items-center justify-between py-3'>
              <div>
                <p className='font-medium'>{food.name}</p>
                <p className='text-muted-foreground text-xs'>
                  {food.calories}kcal / P:{food.protein}g F:{food.fat}g C:{food.carbs}g
                </p>
              </div>
              <Button variant='ghost' size='icon' onClick={() => deleteMutation.mutate(food.id)}>
                <Trash2 className='size-4 text-destructive' />
              </Button>
            </CardContent>
          </Card>
        ))}
        {foods.length === 0 && (
          <p className='text-muted-foreground py-8 text-center text-sm'>食品が登録されていません</p>
        )}
      </div>
    </div>
  )
}
