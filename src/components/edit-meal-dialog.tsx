'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence } from 'motion/react'
import * as m from 'motion/react-m'
import { Check, Minus, Plus, Search } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { api } from '@/lib/api'
import type { FoodRow, MealWithFood } from '@/lib/db'
import { useDebouncedValue } from '@/lib/hooks'
import type { MealType, MealUpdateInput } from '@/lib/schema'
import { mealTypeLabels, mealTypes } from '@/lib/schema'
import { cn } from '@/lib/utils'

const QUICK_FRACTIONS = [
  { label: '1/4', value: 0.25 },
  { label: '1/2', value: 0.5 },
  { label: '3/4', value: 0.75 },
  { label: '1', value: 1 }
]

interface EditMealDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mealId: string
}

export function EditMealDialog({ open, onOpenChange, mealId }: EditMealDialogProps) {
  const queryClient = useQueryClient()

  const { data: meal } = useQuery<MealWithFood>({
    queryKey: ['meal', mealId],
    queryFn: () => api.meals.get(mealId),
    enabled: open && !!mealId
  })

  const [mealType, setMealType] = useState<string | null>(null)
  const [selectedFoodId, setSelectedFoodId] = useState<string | null>(null)
  const [quantity, setQuantity] = useState<number | null>(null)
  const [search, setSearch] = useState('')

  const debouncedSearch = useDebouncedValue(search, 300)

  const activeMealType: MealType = (mealType ?? meal?.meal_type ?? 'lunch') as MealType
  const activeFoodId = selectedFoodId ?? meal?.food_id ?? ''
  const activeQuantity = quantity ?? meal?.quantity ?? 1

  const { data: foods = [] } = useQuery<FoodRow[]>({
    queryKey: ['foods', debouncedSearch],
    queryFn: () => api.foods.list(debouncedSearch || undefined),
    enabled: open
  })

  const selectedFood = foods.find((f) => f.id === activeFoodId)

  const mutation = useMutation({
    mutationFn: (data: MealUpdateInput) => api.meals.update(mealId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meals'] })
      queryClient.invalidateQueries({ queryKey: ['meal', mealId] })
      toast.success('食事を更新しました')
      onOpenChange(false)
    }
  })

  const handleSave = () => {
    const data: MealUpdateInput = {}
    if (mealType !== null) data.meal_type = mealType as MealUpdateInput['meal_type']
    if (selectedFoodId !== null) data.food_id = selectedFoodId
    if (quantity !== null) data.quantity = quantity
    mutation.mutate(data)
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setMealType(null)
      setSelectedFoodId(null)
      setQuantity(null)
      setSearch('')
    }
    onOpenChange(next)
  }

  const adjust = (delta: number) => {
    const current = activeQuantity
    const next = Math.max(0.1, Math.round((current + delta * 0.5) * 10) / 10)
    setQuantity(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='flex max-h-[85dvh] flex-col gap-0 p-0'>
        <DialogHeader className='border-b px-4 py-3'>
          <DialogTitle>食事を編集</DialogTitle>
        </DialogHeader>

        <div className='min-h-0 flex-1 overflow-y-auto px-4 py-3 space-y-4'>
          {/* Meal type */}
          <div className='space-y-1.5'>
            <p className='text-sm font-medium'>食事タイプ</p>
            <Select value={activeMealType} onValueChange={(v) => setMealType(v)}>
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

          {/* Food search */}
          <div className='space-y-1.5'>
            <p className='text-sm font-medium'>食品を変更</p>
            <div className='relative'>
              <Search className='text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2' />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder='食品名を検索...'
                className='pl-9'
              />
            </div>

            <AnimatePresence>
              {foods.length > 0 && (
                <m.div
                  className='space-y-0.5'
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                >
                  {foods.map((food, i) => {
                    const isSelected = activeFoodId === food.id
                    return (
                      <m.button
                        key={food.id}
                        type='button'
                        onClick={() => setSelectedFoodId(food.id)}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
                          isSelected ? 'bg-primary/10' : 'hover:bg-muted'
                        )}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03, type: 'spring', stiffness: 400, damping: 25 }}
                        whileTap={{ scale: 0.97 }}
                        layout
                      >
                        <m.div
                          className={cn(
                            'flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors',
                            isSelected
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-muted-foreground/30'
                          )}
                          animate={isSelected ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          {isSelected && <Check className='size-3' />}
                        </m.div>
                        <div className='flex-1'>
                          <p className='text-sm'>{food.name}</p>
                          <p className='text-muted-foreground text-xs'>
                            {food.calories} kcal / {food.serving}
                          </p>
                        </div>
                      </m.button>
                    )
                  })}
                </m.div>
              )}
            </AnimatePresence>
          </div>

          {/* Selected food info */}
          {selectedFood && (
            <m.div
              className='bg-muted/50 rounded-lg px-3 py-2.5'
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <p className='text-sm font-medium'>{selectedFood.name}</p>
              <p className='text-muted-foreground text-xs mt-0.5'>
                {selectedFood.calories} kcal / P:{selectedFood.protein}g F:{selectedFood.fat}g C:{selectedFood.carbs}g
              </p>
            </m.div>
          )}

          {/* Quantity */}
          <div className='space-y-1.5'>
            <p className='text-sm font-medium'>数量（食分）</p>
            <div className='flex items-center gap-2'>
              <button
                type='button'
                onClick={() => adjust(-1)}
                className='text-muted-foreground hover:text-foreground rounded p-0.5'
              >
                <Minus className='size-4' />
              </button>
              <Input
                type='number'
                step='0.1'
                value={activeQuantity}
                onChange={(e) => {
                  const v = Number.parseFloat(e.target.value)
                  if (!Number.isNaN(v)) setQuantity(v)
                }}
                className='h-9 w-20 px-2 text-center'
              />
              <button
                type='button'
                onClick={() => adjust(1)}
                className='text-muted-foreground hover:text-foreground rounded p-0.5'
              >
                <Plus className='size-4' />
              </button>
            </div>
            <div className='flex gap-1'>
              {QUICK_FRACTIONS.map((f) => (
                <button
                  key={f.label}
                  type='button'
                  onClick={() => setQuantity(f.value)}
                  className={cn(
                    'rounded-md border px-2 py-0.5 text-[10px] transition-colors',
                    activeQuantity === f.value
                      ? 'border-primary bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:border-foreground/30'
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className='border-t px-4 py-3'>
          <Button onClick={handleSave} className='w-full' disabled={mutation.isPending}>
            {mutation.isPending ? '保存中...' : '保存'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
