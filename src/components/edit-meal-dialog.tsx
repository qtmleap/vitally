'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence } from 'motion/react'
import * as m from 'motion/react-m'
import { Check, Plus, Search, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import type { FoodRow, MealWithFood } from '@/lib/db'
import { api } from '@/lib/api'
import { useDebouncedValue } from '@/lib/hooks'
import type { MealType } from '@/lib/schema'
import { mealTypeLabels } from '@/lib/schema'
import { cn } from '@/lib/utils'

interface EditItem {
  id: string
  foodName: string
  foodCalories: number
  quantity: number
  deleted: boolean
}

interface NewItem {
  food: FoodRow
  quantity: number
}

interface EditMealDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  meals: MealWithFood[]
  mealType: MealType
  date: string
}

export function EditMealDialog({ open, onOpenChange, meals, mealType, date }: EditMealDialogProps) {
  const queryClient = useQueryClient()
  const [items, setItems] = useState<EditItem[]>([])
  const [newItems, setNewItems] = useState<NewItem[]>([])
  const [search, setSearch] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const debouncedSearch = useDebouncedValue(search, 300)

  useEffect(() => {
    if (open && meals.length > 0) {
      setItems(
        meals.map((meal) => ({
          id: meal.id,
          foodName: meal.food_name,
          foodCalories: meal.food_calories,
          quantity: meal.quantity,
          deleted: false
        }))
      )
    }
  }, [open, meals])

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.meals.delete(id)
  })

  const createMutation = useMutation({
    mutationFn: (data: { date: string; meal_type: MealType; food_id: string; quantity: number }) =>
      api.meals.create(data)
  })

  const { data: foods = [] } = useQuery<FoodRow[]>({
    queryKey: ['foods', debouncedSearch],
    queryFn: () => api.foods.list(debouncedSearch || undefined),
    enabled: open && showSearch
  })

  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const deletes = items.filter((i) => i.deleted)

      await Promise.all([
        ...deletes.map((i) => deleteMutation.mutateAsync(i.id)),
        ...newItems.map((i) => createMutation.mutateAsync({ date, meal_type: mealType, food_id: i.food.id, quantity: i.quantity }))
      ])

      queryClient.invalidateQueries({ queryKey: ['meals'] })
      const msgs: string[] = []
      if (newItems.length > 0) msgs.push(`${newItems.length}件追加`)
      if (deletes.length > 0) msgs.push(`${deletes.length}件削除`)
      if (msgs.length > 0) toast.success(msgs.join('、') + 'しました')
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setItems([])
      setNewItems([])
      setSearch('')
      setShowSearch(false)
    }
    onOpenChange(next)
  }

  const toggleDelete = (id: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, deleted: !i.deleted } : i)))
  }

  const removeNewItem = (foodId: string) => {
    setNewItems((prev) => prev.filter((i) => i.food.id !== foodId))
  }

  const addFood = (food: FoodRow) => {
    const existingIds = new Set(meals.map((m) => m.food_id))
    const newIds = new Set(newItems.map((i) => i.food.id))
    if (existingIds.has(food.id) || newIds.has(food.id)) return
    setNewItems((prev) => [...prev, { food, quantity: 1 }])
    setSearch('')
    setShowSearch(false)
  }

  const inBasket = new Set([...meals.map((m) => m.food_id), ...newItems.map((i) => i.food.id)])

  const activeExisting = items.filter((i) => !i.deleted)
  const totalCalories =
    activeExisting.reduce((s, i) => s + i.foodCalories * i.quantity, 0) +
    newItems.reduce((s, i) => s + i.food.calories * i.quantity, 0)

  const hasChanges = items.some((i) => i.deleted) || newItems.length > 0

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='flex max-h-[85dvh] flex-col gap-0 p-0'>
        <DialogHeader className='border-b px-4 py-3'>
          <DialogTitle>{mealTypeLabels[mealType]}を編集</DialogTitle>
        </DialogHeader>

        <div className='min-h-0 flex-1 overflow-y-auto px-4 py-3 space-y-2'>
          {/* Existing items */}
          <AnimatePresence mode='popLayout'>
            {items.map((item) => (
              <m.div
                key={item.id}
                layout
                initial={{ opacity: 0, x: -20, height: 0 }}
                animate={{ opacity: 1, x: 0, height: 'auto' }}
                exit={{ opacity: 0, x: 20, height: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <div
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-3 py-2.5 transition-opacity',
                    item.deleted && 'opacity-40'
                  )}
                >
                  <div className='min-w-0 flex-1'>
                    <p className={cn('truncate text-sm', item.deleted && 'line-through')}>{item.foodName}</p>
                    <p className='text-muted-foreground text-xs'>
                      {Math.round(item.foodCalories * item.quantity)} kcal
                    </p>
                  </div>
                  <button
                    type='button'
                    onClick={() => toggleDelete(item.id)}
                    className={cn(
                      'shrink-0 transition-colors',
                      item.deleted ? 'text-destructive hover:text-destructive/80' : 'text-muted-foreground hover:text-destructive'
                    )}
                  >
                    <Trash2 className='size-4' />
                  </button>
                </div>
              </m.div>
            ))}
          </AnimatePresence>

          {/* New items */}
          <AnimatePresence mode='popLayout'>
            {newItems.map((item) => (
              <m.div
                key={item.food.id}
                layout
                initial={{ opacity: 0, x: -20, height: 0 }}
                animate={{ opacity: 1, x: 0, height: 'auto' }}
                exit={{ opacity: 0, x: 20, height: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <div className='flex items-center gap-2 rounded-lg px-3 py-2.5'>
                  <div className='min-w-0 flex-1'>
                    <div className='flex items-center gap-1.5'>
                      <p className='truncate text-sm'>{item.food.name}</p>
                      <span className='bg-primary/10 text-primary shrink-0 rounded px-1 text-[10px] font-medium'>NEW</span>
                    </div>
                    <p className='text-muted-foreground text-xs'>
                      {Math.round(item.food.calories * item.quantity)} kcal
                    </p>
                  </div>
                  <button
                    type='button'
                    onClick={() => removeNewItem(item.food.id)}
                    className='text-muted-foreground hover:text-destructive shrink-0 transition-colors'
                  >
                    <Trash2 className='size-4' />
                  </button>
                </div>
              </m.div>
            ))}
          </AnimatePresence>

          {/* Add food */}
          {showSearch ? (
            <m.div
              className='space-y-2'
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            >
              <div className='relative'>
                <Search className='text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2' />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder='食品名を検索...'
                  className='pl-9'
                  autoFocus
                />
              </div>
              {debouncedSearch.length > 0 && foods.length > 0 && (
                <div className='max-h-40 space-y-0.5 overflow-y-auto'>
                  {foods.map((food, i) => {
                    const selected = inBasket.has(food.id)
                    return (
                      <m.button
                        key={food.id}
                        type='button'
                        onClick={() => !selected && addFood(food)}
                        disabled={selected}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
                          selected ? 'opacity-40' : 'hover:bg-muted'
                        )}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03, type: 'spring', stiffness: 400, damping: 25 }}
                        whileTap={selected ? undefined : { scale: 0.97 }}
                      >
                        <m.div
                          className={cn(
                            'flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors',
                            selected ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/30'
                          )}
                          animate={selected ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          {selected && <Check className='size-3' />}
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
                </div>
              )}
            </m.div>
          ) : (
            <button
              type='button'
              onClick={() => setShowSearch(true)}
              className='text-primary hover:text-primary/80 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed py-2.5 text-sm transition-colors'
            >
              <Plus className='size-4' />
              品目を追加
            </button>
          )}
        </div>

        <div className='border-t px-4 py-3 space-y-1'>
          <div className='text-muted-foreground mb-1 text-center text-xs'>合計 {Math.round(totalCalories)} kcal</div>
          <Button onClick={handleSave} className='w-full' disabled={saving || !hasChanges}>
            {saving ? '保存中...' : '保存'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
