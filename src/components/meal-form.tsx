'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { Check } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import * as m from 'motion/react-m'

import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { api } from '@/lib/api'
import { selectedDateAtom } from '@/lib/atoms'
import type { FoodRow } from '@/lib/db'
import { mealSchema, mealTypeLabels, mealTypes, type MealInput } from '@/lib/schema'

export function MealForm() {
  const date = useAtomValue(selectedDateAtom)
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')

  const { data: foods = [] } = useQuery<FoodRow[]>({
    queryKey: ['foods', search],
    queryFn: () => api.foods.list(search || undefined)
  })

  const form = useForm<MealInput>({
    resolver: zodResolver(mealSchema) as never,
    defaultValues: { date, meal_type: 'lunch', food_id: '', quantity: 1 }
  })

  const foodId = form.watch('food_id')
  const selectedFood = foods.find((f) => f.id === foodId)

  const mutation = useMutation({
    mutationFn: api.meals.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meals'] })
      form.reset({ date, meal_type: form.getValues('meal_type'), food_id: '', quantity: 1 })
      setSearch('')
      toast.success('食事を記録しました')
    }
  })

  const onSubmit = (values: MealInput) => {
    mutation.mutate({ ...values, date })
  }

  return (
    <m.div
      className='p-4'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
    >
      <PageHeader title='食事を追加' />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='mt-4 space-y-4'>
          <FormField
            control={form.control}
            name='meal_type'
            render={({ field }) => (
              <FormItem>
                <FormLabel>食事タイプ</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {mealTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {mealTypeLabels[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className='space-y-2'>
            <FormLabel>食品を検索</FormLabel>
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder='食品名を入力...' />
            {foods.length > 0 && (
              <div className='max-h-40 space-y-0.5 overflow-y-auto'>
                {foods.map((food) => {
                  const selected = foodId === food.id
                  return (
                    <button
                      key={food.id}
                      type='button'
                      onClick={() => form.setValue('food_id', food.id, { shouldValidate: true })}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${selected ? 'bg-primary/10' : 'hover:bg-muted'}`}
                    >
                      <div
                        className={`flex size-4 shrink-0 items-center justify-center rounded-full border ${selected ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/30'}`}
                      >
                        {selected && <Check className='size-2.5' />}
                      </div>
                      <span className='flex-1'>{food.name}</span>
                      <span className='text-muted-foreground text-xs'>{food.calories} kcal</span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
          {selectedFood && (
            <p className='text-muted-foreground text-xs'>
              {selectedFood.calories} kcal / P:{selectedFood.protein}g F:{selectedFood.fat}g C:{selectedFood.carbs}g
            </p>
          )}
          <FormField
            control={form.control}
            name='quantity'
            render={({ field }) => (
              <FormItem>
                <FormLabel>数量</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    step='0.1'
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type='submit' className='w-full' disabled={mutation.isPending || !foodId}>
            {mutation.isPending ? '保存中...' : '保存'}
          </Button>
        </form>
      </Form>
    </m.div>
  )
}
