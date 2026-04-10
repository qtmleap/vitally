'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ScanBarcode, Sparkles } from 'lucide-react'
import * as m from 'motion/react-m'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { BarcodeScanner } from '@/components/barcode-scanner'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { api } from '@/lib/api'
import { type FoodInput, foodSchema } from '@/lib/schema'
import { useSkipAnimation } from '@/lib/use-skip-animation'

export function FoodForm() {
  const queryClient = useQueryClient()
  const [estimating, setEstimating] = useState(false)
  const [scannerOpen, setScannerOpen] = useState(false)
  const skipAnimation = useSkipAnimation()

  const form = useForm<FoodInput>({
    resolver: zodResolver(foodSchema) as never,
    mode: 'onBlur',
    defaultValues: {
      name: '',
      calories: undefined as unknown as number,
      protein: undefined as unknown as number,
      fat: undefined as unknown as number,
      carbs: undefined as unknown as number,
      serving: '1食分'
    }
  })

  const mutation = useMutation({
    mutationFn: (data: Parameters<typeof api.createFood>[0]) => api.createFood(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foods'] })
      form.reset()
      toast.success('食品を登録しました')
    }
  })

  const onSubmit = (values: FoodInput) => {
    mutation.mutate(values)
  }

  const handleEstimate = async () => {
    const name = form.getValues('name')
    if (!name) return
    setEstimating(true)
    try {
      const result = await api.estimateNutrition({ name, serving: form.getValues('serving') })
      form.setValue('calories', result.calories, { shouldValidate: true })
      form.setValue('protein', result.protein)
      form.setValue('fat', result.fat)
      form.setValue('carbs', result.carbs)
    } catch {
      // AI 失敗時は何もしない
    } finally {
      setEstimating(false)
    }
  }

  const handleBarcodeResult = (result: {
    name: string
    calories: number
    protein: number
    fat: number
    carbs: number
    serving: string
  }) => {
    form.setValue('name', result.name, { shouldValidate: true })
    form.setValue('calories', result.calories, { shouldValidate: true })
    form.setValue('protein', result.protein)
    form.setValue('fat', result.fat)
    form.setValue('carbs', result.carbs)
    form.setValue('serving', result.serving)
  }

  return (
    <m.div
      className='p-4'
      initial={skipAnimation ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
    >
      <PageHeader title='食品を追加' back />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='mt-4 space-y-4'>
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>名前</FormLabel>
                <div className='flex gap-2'>
                  <FormControl>
                    <Input placeholder='鶏むね肉、白米など' {...field} />
                  </FormControl>
                  <Button
                    type='button'
                    variant='outline'
                    size='icon'
                    onClick={() => setScannerOpen(true)}
                    title='バーコードスキャン'
                  >
                    <ScanBarcode className='size-4' />
                  </Button>
                  <Button
                    type='button'
                    variant='outline'
                    size='icon'
                    onClick={handleEstimate}
                    disabled={estimating || !form.watch('name')}
                    title='AI で栄養素を概算'
                  >
                    <Sparkles className={`size-4 ${estimating ? 'animate-pulse' : ''}`} />
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='calories'
            render={({ field }) => (
              <FormItem>
                <FormLabel>カロリー (kcal)</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    placeholder='250'
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className='grid grid-cols-3 gap-2'>
            <FormField
              control={form.control}
              name='protein'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>P (g)</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='fat'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>F (g)</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='carbs'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>C (g)</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name='serving'
            render={({ field }) => (
              <FormItem>
                <FormLabel>1食分の量</FormLabel>
                <FormControl>
                  <Input placeholder='100g、1個など' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type='submit' className='w-full' disabled={mutation.isPending}>
            {mutation.isPending ? '保存中...' : '保存'}
          </Button>
        </form>
      </Form>
      <BarcodeScanner open={scannerOpen} onOpenChange={setScannerOpen} onResult={handleBarcodeResult} />
    </m.div>
  )
}
