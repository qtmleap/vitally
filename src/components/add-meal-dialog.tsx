'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, Minus, Plus, Search, X } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { AnimatePresence } from 'motion/react'
import * as m from 'motion/react-m'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { api } from '@/lib/api'
import type { FoodRow } from '@/lib/db'
import type { MealType } from '@/lib/schema'
import { mealTypeLabels } from '@/lib/schema'

type Unit = 'serving' | 'g'

interface BasketItem {
  food: FoodRow
  amount: number
  unit: Unit
}

const basketItemSchema = z.object({
  amount: z.number().min(0.1, '0.1以上を入力')
})

interface AddMealDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mealType: MealType
  date: string
}

function BasketRow({
  item,
  onRemove,
  onUpdate
}: {
  item: BasketItem
  onRemove: () => void
  onUpdate: (amount: number, unit: Unit) => void
}) {
  const form = useForm<z.infer<typeof basketItemSchema>>({
    resolver: zodResolver(basketItemSchema),
    defaultValues: { amount: item.amount },
    mode: 'onChange'
  })

  const amount = form.watch('amount')
  const unit = item.unit

  const calcCal = unit === 'g' ? (item.food.calories / 100) * amount : item.food.calories * amount
  const step = unit === 'g' ? 10 : 0.5

  const adjust = (delta: number) => {
    const next = Math.max(step, Math.round((amount + delta * step) * 10) / 10)
    form.setValue('amount', next, { shouldValidate: true })
    onUpdate(next, unit)
  }

  const toggleUnit = () => {
    const newUnit: Unit = unit === 'serving' ? 'g' : 'serving'
    const newAmount = newUnit === 'g' ? 100 : 1
    form.setValue('amount', newAmount, { shouldValidate: true })
    onUpdate(newAmount, newUnit)
  }

  return (
    <div className='space-y-1'>
      <div className='flex items-center gap-2'>
        <button type='button' onClick={onRemove} className='text-muted-foreground hover:text-destructive shrink-0'>
          <X className='size-4' />
        </button>
        <div className='min-w-0 flex-1'>
          <p className='truncate text-sm'>{item.food.name}</p>
          <p className='text-muted-foreground text-xs'>{Math.round(calcCal)} kcal</p>
        </div>
        <div className='flex shrink-0 items-center gap-1'>
          <button type='button' onClick={() => adjust(-1)} className='text-muted-foreground hover:text-foreground rounded p-0.5'>
            <Minus className='size-3.5' />
          </button>
          <Form {...form}>
            <FormField
              control={form.control}
              name='amount'
              render={({ field }) => (
                <FormItem className='space-y-0'>
                  <FormControl>
                    <Input
                      {...field}
                      type='number'
                      step={unit === 'g' ? 1 : 0.1}
                      onChange={(e) => {
                        const v = Number.parseFloat(e.target.value)
                        if (!Number.isNaN(v)) {
                          field.onChange(v)
                          onUpdate(v, unit)
                        }
                      }}
                      className='h-7 w-14 px-1 text-center text-xs'
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </Form>
          <button type='button' onClick={() => adjust(1)} className='text-muted-foreground hover:text-foreground rounded p-0.5'>
            <Plus className='size-3.5' />
          </button>
          <button
            type='button'
            onClick={toggleUnit}
            className='text-muted-foreground hover:text-foreground w-10 rounded-md border px-1.5 py-0.5 text-center text-[10px]'
          >
            {unit === 'serving' ? '食分' : 'g'}
          </button>
        </div>
      </div>
      {form.formState.errors.amount && (
        <p className='text-destructive pl-6 text-[10px]'>{form.formState.errors.amount.message}</p>
      )}
    </div>
  )
}

export function AddMealDialog({ open, onOpenChange, mealType, date }: AddMealDialogProps) {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [basket, setBasket] = useState<BasketItem[]>([])

  const { data: foods = [] } = useQuery<FoodRow[]>({
    queryKey: ['foods', search],
    queryFn: () => api.foods.list(search || undefined),
    enabled: open
  })

  const addToBasket = useCallback((food: FoodRow) => {
    setBasket((prev) => {
      if (prev.some((item) => item.food.id === food.id)) return prev
      return [...prev, { food, amount: 1, unit: 'serving' }]
    })
  }, [])

  const removeFromBasket = useCallback((foodId: string) => {
    setBasket((prev) => prev.filter((item) => item.food.id !== foodId))
  }, [])

  const updateItem = useCallback((foodId: string, amount: number, unit: Unit) => {
    setBasket((prev) =>
      prev.map((item) => (item.food.id === foodId ? { ...item, amount, unit } : item))
    )
  }, [])

  const totalCalories = basket.reduce((s, item) => {
    const cal = item.unit === 'g' ? (item.food.calories / 100) * item.amount : item.food.calories * item.amount
    return s + cal
  }, 0)

  const hasInvalid = basket.some((item) => item.amount < 0.1)

  const mutation = useMutation({
    mutationFn: async () => {
      for (const item of basket) {
        const quantity = item.unit === 'g' ? item.amount / 100 : item.amount
        await api.meals.create({ date, meal_type: mealType, food_id: item.food.id, quantity })
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meals'] })
      setBasket([])
      setSearch('')
      onOpenChange(false)
    }
  })

  const inBasket = new Set(basket.map((item) => item.food.id))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex max-h-[85dvh] flex-col gap-0 p-0'>
        <DialogHeader className='border-b px-4 py-3'>
          <DialogTitle>{mealTypeLabels[mealType]}を追加</DialogTitle>
        </DialogHeader>

        <div className='border-b px-4 py-3'>
          <div className='relative'>
            <Search className='text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2' />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder='食品名を検索...' className='pl-9' />
          </div>
        </div>

        <div className='min-h-0 flex-1 overflow-y-auto px-4 py-2'>
          {foods.length > 0 ? (
            <div className='space-y-0.5'>
              {foods.map((food, i) => {
                const selected = inBasket.has(food.id)
                return (
                  <m.button
                    key={food.id}
                    type='button'
                    onClick={() => (selected ? removeFromBasket(food.id) : addToBasket(food))}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${selected ? 'bg-primary/10' : 'hover:bg-muted'}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03, type: 'spring', stiffness: 400, damping: 25 }}
                    whileTap={{ scale: 0.97 }}
                    layout
                  >
                    <m.div
                      className={`flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors ${selected ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/30'}`}
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
          ) : (
            <m.p
              className='text-muted-foreground py-8 text-center text-sm'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
            >
              {search ? '見つかりません' : '食品を検索してください'}
            </m.p>
          )}
        </div>

        <AnimatePresence>
          {basket.length > 0 && (
            <m.div
              className='border-t px-4 py-3'
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            >
              <div className='mb-3 space-y-2'>
                <AnimatePresence mode='popLayout'>
                  {basket.map((item) => (
                    <m.div
                      key={item.food.id}
                      layout
                      initial={{ opacity: 0, x: -20, height: 0 }}
                      animate={{ opacity: 1, x: 0, height: 'auto' }}
                      exit={{ opacity: 0, x: 20, height: 0 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    >
                      <BasketRow
                        item={item}
                        onRemove={() => removeFromBasket(item.food.id)}
                        onUpdate={(amount, unit) => updateItem(item.food.id, amount, unit)}
                      />
                    </m.div>
                  ))}
                </AnimatePresence>
              </div>
              <m.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Button onClick={() => mutation.mutate()} className='w-full' disabled={mutation.isPending || hasInvalid}>
                  {mutation.isPending ? '保存中...' : `${basket.length}品目を追加（${Math.round(totalCalories)} kcal）`}
                </Button>
              </m.div>
            </m.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
