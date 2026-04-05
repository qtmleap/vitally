'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { useState } from 'react'

import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { api } from '@/lib/api'
import { selectedDateAtom } from '@/lib/atoms'
import type { FoodRow } from '@/lib/db'
import { mealTypeLabels, mealTypes } from '@/lib/schema'

export function MealForm() {
  const date = useAtomValue(selectedDateAtom)
  const queryClient = useQueryClient()
  const [mealType, setMealType] = useState<string>('lunch')
  const [foodId, setFoodId] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [search, setSearch] = useState('')

  const { data: foods = [] } = useQuery<FoodRow[]>({
    queryKey: ['foods', search],
    queryFn: () => api.foods.list(search || undefined)
  })

  const selectedFood = foods.find((f) => f.id === foodId)

  const mutation = useMutation({
    mutationFn: api.meals.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meals'] })
      setFoodId('')
      setQuantity('1')
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate({
      date,
      meal_type: mealType as 'breakfast' | 'lunch' | 'dinner' | 'snack',
      food_id: foodId,
      quantity: Number(quantity)
    })
  }

  return (
    <div className='p-4'>
      <PageHeader title='食事を追加' />
      <Card>
        <CardContent className='pt-4'>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
              <Label>食事タイプ</Label>
              <Select value={mealType} onValueChange={setMealType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mealTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {mealTypeLabels[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>食品を検索</Label>
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder='食品名を入力...' />
              {foods.length > 0 && (
                <div className='mt-2 max-h-40 space-y-1 overflow-y-auto'>
                  {foods.map((food) => (
                    <button
                      key={food.id}
                      type='button'
                      onClick={() => setFoodId(food.id)}
                      className={`w-full rounded-md border p-2 text-left text-sm ${foodId === food.id ? 'border-primary bg-primary/5' : ''}`}
                    >
                      {food.name}
                      <span className='text-xs opacity-70'>{food.calories}kcal</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {selectedFood && (
              <p className='text-muted-foreground text-xs'>
                {selectedFood.calories}kcal / P:{selectedFood.protein}g F:{selectedFood.fat}g C:
                {selectedFood.carbs}g
              </p>
            )}
            <div>
              <Label htmlFor='quantity'>数量</Label>
              <Input
                id='quantity'
                type='number'
                step='0.1'
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
            <Button type='submit' className='w-full' disabled={mutation.isPending || !foodId}>
              {mutation.isPending ? '保存中...' : '保存'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
