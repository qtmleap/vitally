'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { use, useState } from 'react'
import { useRouter } from 'vinext/shims/navigation'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { api } from '@/lib/api'
import type { FoodRow, MealWithFood } from '@/lib/db'
import type { MealUpdateInput } from '@/lib/schema'
import { mealTypeLabels, mealTypes } from '@/lib/schema'

export default function EditMealPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data: meal, isLoading } = useQuery<MealWithFood>({
    queryKey: ['meal', id],
    queryFn: () => api.meals.get(id)
  })

  const [mealType, setMealType] = useState<string | null>(null)
  const [foodId, setFoodId] = useState<string | null>(null)
  const [quantity, setQuantity] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const activeMealType = mealType ?? meal?.meal_type ?? 'lunch'
  const activeFoodId = foodId ?? meal?.food_id ?? ''
  const activeQuantity = quantity ?? String(meal?.quantity ?? 1)

  const { data: foods = [] } = useQuery<FoodRow[]>({
    queryKey: ['foods', search],
    queryFn: () => api.foods.list(search || undefined)
  })

  const selectedFood = foods.find((f) => f.id === activeFoodId)

  const mutation = useMutation({
    mutationFn: (data: MealUpdateInput) => api.meals.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meals'] })
      router.push('/meals')
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const data: MealUpdateInput = {}
    if (mealType !== null) data.meal_type = mealType as MealUpdateInput['meal_type']
    if (foodId !== null) data.food_id = foodId
    if (quantity !== null) data.quantity = Number(quantity)
    mutation.mutate(data)
  }

  if (isLoading) {
    return (
      <div className='p-4'>
        <PageHeader title='食事を編集' />
        <p className='text-muted-foreground py-8 text-center text-sm'>読み込み中...</p>
      </div>
    )
  }

  if (!meal) {
    return (
      <div className='p-4'>
        <PageHeader title='食事を編集' />
        <p className='text-muted-foreground py-8 text-center text-sm'>食事記録が見つかりません</p>
      </div>
    )
  }

  return (
    <div className='p-4'>
      <PageHeader title='食事を編集' />
      <Card>
        <CardContent className='pt-4'>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
              <Label>食事タイプ</Label>
              <Select value={activeMealType} onValueChange={setMealType}>
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
                      className={`w-full rounded-md border p-2 text-left text-sm ${activeFoodId === food.id ? 'border-primary bg-primary/5' : ''}`}
                    >
                      {food.name}
                      <span className='text-xs opacity-70'> {food.calories}kcal</span>
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
                value={activeQuantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
            <Button type='submit' className='w-full' disabled={mutation.isPending}>
              {mutation.isPending ? '保存中...' : '保存'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
