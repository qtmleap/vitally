'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence } from 'motion/react'
import * as m from 'motion/react-m'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import type { MealWithFood } from '@/lib/db'
import { api } from '@/lib/api'
import type { MealType } from '@/lib/schema'
import { mealTypeLabels } from '@/lib/schema'
import { cn } from '@/lib/utils'

const QUICK_FRACTIONS = [
  { label: '1/4', value: 0.25 },
  { label: '1/2', value: 0.5 },
  { label: '3/4', value: 0.75 },
  { label: '1', value: 1 }
]

interface EditItem {
  id: string
  foodName: string
  foodCalories: number
  quantity: number
  deleted: boolean
}

interface EditMealDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  meals: MealWithFood[]
  mealType: MealType
}

export function EditMealDialog({ open, onOpenChange, meals, mealType }: EditMealDialogProps) {
  const queryClient = useQueryClient()
  const [items, setItems] = useState<EditItem[]>([])

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

  const updateMutation = useMutation({
    mutationFn: (item: { id: string; quantity: number }) => api.meals.update(item.id, { quantity: item.quantity })
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.meals.delete(id)
  })

  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const updates = items.filter((i) => !i.deleted)
      const deletes = items.filter((i) => i.deleted)

      await Promise.all([
        ...updates
          .filter((i) => {
            const orig = meals.find((m) => m.id === i.id)
            return orig && orig.quantity !== i.quantity
          })
          .map((i) => updateMutation.mutateAsync({ id: i.id, quantity: i.quantity })),
        ...deletes.map((i) => deleteMutation.mutateAsync(i.id))
      ])

      queryClient.invalidateQueries({ queryKey: ['meals'] })
      const deleted = deletes.length
      const updated = updates.filter((i) => {
        const orig = meals.find((m) => m.id === i.id)
        return orig && orig.quantity !== i.quantity
      }).length
      if (deleted > 0 && updated > 0) {
        toast.success(`${updated}件更新、${deleted}件削除しました`)
      } else if (deleted > 0) {
        toast.success(`${deleted}件削除しました`)
      } else if (updated > 0) {
        toast.success(`${updated}件更新しました`)
      }
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) setItems([])
    onOpenChange(next)
  }

  const adjust = (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i
        const next = Math.max(0.1, Math.round((i.quantity + delta * 0.5) * 10) / 10)
        return { ...i, quantity: next }
      })
    )
  }

  const setQuantity = (id: string, value: number) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity: value } : i)))
  }

  const toggleDelete = (id: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, deleted: !i.deleted } : i)))
  }

  const activeItems = items.filter((i) => !i.deleted)
  const totalCalories = activeItems.reduce((s, i) => s + i.foodCalories * i.quantity, 0)
  const hasChanges = items.some((i) => {
    if (i.deleted) return true
    const orig = meals.find((m) => m.id === i.id)
    return orig && orig.quantity !== i.quantity
  })

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='flex max-h-[85dvh] flex-col gap-0 p-0'>
        <DialogHeader className='border-b px-4 py-3'>
          <DialogTitle>{mealTypeLabels[mealType]}を編集</DialogTitle>
        </DialogHeader>

        <div className='min-h-0 flex-1 overflow-y-auto px-4 py-3'>
          <AnimatePresence mode='popLayout'>
            {items.map((item) => (
              <m.div
                key={item.id}
                layout
                initial={{ opacity: 0, x: -20, height: 0 }}
                animate={{ opacity: 1, x: 0, height: 'auto' }}
                exit={{ opacity: 0, x: 20, height: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className='py-1.5'
              >
                <div
                  className={cn(
                    'space-y-1.5 rounded-lg px-3 py-2.5 transition-opacity',
                    item.deleted && 'opacity-40'
                  )}
                >
                  <div className='flex items-center gap-2'>
                    <button
                      type='button'
                      onClick={() => toggleDelete(item.id)}
                      className={cn(
                        'shrink-0 transition-colors',
                        item.deleted
                          ? 'text-destructive hover:text-destructive/80'
                          : 'text-muted-foreground hover:text-destructive'
                      )}
                    >
                      <Trash2 className='size-4' />
                    </button>
                    <div className='min-w-0 flex-1'>
                      <p className={cn('truncate text-sm', item.deleted && 'line-through')}>{item.foodName}</p>
                      <p className='text-muted-foreground text-xs'>
                        {Math.round(item.foodCalories * item.quantity)} kcal
                      </p>
                    </div>
                    {!item.deleted && (
                      <div className='flex shrink-0 items-center gap-1'>
                        <button
                          type='button'
                          onClick={() => adjust(item.id, -1)}
                          className='text-muted-foreground hover:text-foreground rounded p-0.5'
                        >
                          <Minus className='size-3.5' />
                        </button>
                        <Input
                          type='number'
                          step='0.1'
                          value={item.quantity}
                          onChange={(e) => {
                            const v = Number.parseFloat(e.target.value)
                            if (!Number.isNaN(v) && v > 0) setQuantity(item.id, v)
                          }}
                          className='h-7 w-14 px-1 text-center text-xs'
                        />
                        <button
                          type='button'
                          onClick={() => adjust(item.id, 1)}
                          className='text-muted-foreground hover:text-foreground rounded p-0.5'
                        >
                          <Plus className='size-3.5' />
                        </button>
                      </div>
                    )}
                  </div>
                  {!item.deleted && (
                    <div className='flex gap-1 pl-6'>
                      {QUICK_FRACTIONS.map((f) => (
                        <button
                          key={f.label}
                          type='button'
                          onClick={() => setQuantity(item.id, f.value)}
                          className={cn(
                            'rounded-md border px-2 py-0.5 text-[10px] transition-colors',
                            item.quantity === f.value
                              ? 'border-primary bg-primary/10 text-primary font-medium'
                              : 'text-muted-foreground hover:text-foreground hover:border-foreground/30'
                          )}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </m.div>
            ))}
          </AnimatePresence>
        </div>

        <div className='border-t px-4 py-3 space-y-1'>
          <div className='text-muted-foreground mb-1 text-center text-xs'>
            合計 {Math.round(totalCalories)} kcal
          </div>
          <Button onClick={handleSave} className='w-full' disabled={saving || !hasChanges}>
            {saving ? '保存中...' : '保存'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
