'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, Plus, Search, Trash2 } from 'lucide-react'
import { AnimatePresence } from 'motion/react'
import * as m from 'motion/react-m'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { api } from '@/lib/api'
import type { FoodRow, MealTemplateRow } from '@/lib/db'
import { useDebouncedValue } from '@/lib/hooks'
import { cn } from '@/lib/utils'

interface EditTemplateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template: MealTemplateRow
}

interface EditItem {
  foodId: string
  foodName: string
  foodCalories: number
  quantity: number
}

const formSchema = z.object({
  name: z.string().min(1, '名前を入力してください')
})

type FormValues = z.infer<typeof formSchema>

export function EditTemplateDialog({ open, onOpenChange, template }: EditTemplateDialogProps) {
  const queryClient = useQueryClient()
  const [items, setItems] = useState<EditItem[]>([])
  const [search, setSearch] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const debouncedSearch = useDebouncedValue(search, 300)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: template.name }
  })

  useEffect(() => {
    if (open) {
      form.reset({ name: template.name })
      setItems(
        template.items.map((i) => ({
          foodId: i.food.id,
          foodName: i.food.name,
          foodCalories: i.food.calories,
          quantity: i.quantity
        }))
      )
    }
  }, [open, template, form])

  const { data: foods = [] } = useQuery<FoodRow[]>({
    queryKey: ['foods', debouncedSearch],
    queryFn: () => api.listFoods({ queries: { q: debouncedSearch || undefined } }),
    enabled: open && showSearch
  })

  const updateMutation = useMutation({
    mutationFn: (data: FormValues) =>
      api.updateTemplate(
        {
          name: data.name,
          items: items.map((i) => ({ food_id: i.foodId, quantity: i.quantity }))
        },
        { params: { id: template.id } }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] })
      toast.success('テンプレートを更新しました')
      onOpenChange(false)
    }
  })

  const addFood = (food: FoodRow) => {
    if (items.some((i) => i.foodId === food.id)) return
    setItems((prev) => [...prev, { foodId: food.id, foodName: food.name, foodCalories: food.calories, quantity: 1 }])
    setSearch('')
    setShowSearch(false)
  }

  const removeItem = (foodId: string) => {
    setItems((prev) => prev.filter((i) => i.foodId !== foodId))
  }

  const updateQuantity = (foodId: string, quantity: number) => {
    setItems((prev) => prev.map((i) => (i.foodId === foodId ? { ...i, quantity } : i)))
  }

  const totalCalories = items.reduce((s, i) => s + i.foodCalories * i.quantity, 0)

  const onSubmit = (data: FormValues) => {
    if (items.length === 0) {
      toast.error('1品目以上追加してください')
      return
    }
    updateMutation.mutate(data)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex max-h-[85dvh] flex-col gap-0 p-0'>
        <DialogHeader className='border-b px-4 py-3'>
          <DialogTitle>テンプレートを編集</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='flex min-h-0 flex-1 flex-col'>
            <div className='min-h-0 flex-1 overflow-y-auto px-4 py-3 space-y-3'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>名前</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='朝食セット など' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='space-y-2'>
                <p className='text-sm font-medium'>品目</p>
                <AnimatePresence mode='popLayout'>
                  {items.map((item) => (
                    <m.div
                      key={item.foodId}
                      layout
                      initial={{ opacity: 0, x: -20, height: 0 }}
                      animate={{ opacity: 1, x: 0, height: 'auto' }}
                      exit={{ opacity: 0, x: 20, height: 0 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    >
                      <div className='flex items-center gap-2 rounded-lg px-3 py-2.5'>
                        <div className='min-w-0 flex-1'>
                          <p className='truncate text-sm'>{item.foodName}</p>
                          <p className='text-muted-foreground text-xs'>
                            {Math.round(item.foodCalories * item.quantity)} kcal
                          </p>
                        </div>
                        <Input
                          type='number'
                          step='0.1'
                          min='0.1'
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.foodId, Number(e.target.value))}
                          className='h-8 w-16 text-right text-sm'
                        />
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          className='text-muted-foreground hover:text-destructive size-8 shrink-0'
                          onClick={() => removeItem(item.foodId)}
                        >
                          <Trash2 className='size-4' />
                        </Button>
                      </div>
                    </m.div>
                  ))}
                </AnimatePresence>

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
                    {foods.length > 0 && (
                      <div className='max-h-40 space-y-0.5 overflow-y-auto'>
                        {foods.map((food) => {
                          const selected = items.some((i) => i.foodId === food.id)
                          return (
                            <button
                              key={food.id}
                              type='button'
                              onClick={() => !selected && addFood(food)}
                              disabled={selected}
                              className={cn(
                                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
                                selected ? 'opacity-40' : 'hover:bg-muted'
                              )}
                            >
                              <div
                                className={cn(
                                  'flex size-5 shrink-0 items-center justify-center rounded-full border',
                                  selected
                                    ? 'border-primary bg-primary text-primary-foreground'
                                    : 'border-muted-foreground/30'
                                )}
                              >
                                {selected && <Check className='size-3' />}
                              </div>
                              <div className='flex-1'>
                                <p className='text-sm'>{food.name}</p>
                                <p className='text-muted-foreground text-xs'>
                                  {food.calories} kcal / {food.serving}
                                </p>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </m.div>
                ) : (
                  <Button
                    type='button'
                    variant='outline'
                    className='w-full border-dashed gap-1.5'
                    onClick={() => setShowSearch(true)}
                  >
                    <Plus className='size-4' />
                    品目を追加
                  </Button>
                )}
              </div>
            </div>

            <div className='border-t px-4 py-3 space-y-1'>
              <div className='text-muted-foreground mb-1 text-center text-xs'>
                合計 {Math.round(totalCalories)} kcal
              </div>
              <Button type='submit' className='w-full' disabled={updateMutation.isPending}>
                {updateMutation.isPending ? '保存中...' : '保存'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
