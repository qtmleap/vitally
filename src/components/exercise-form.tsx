'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import * as m from 'motion/react-m'

import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { api } from '@/lib/api'
import { selectedDateAtom } from '@/lib/atoms'
import { exerciseSchema, type ExerciseInput } from '@/lib/schema'

export function ExerciseForm() {
  const date = useAtomValue(selectedDateAtom)
  const queryClient = useQueryClient()

  const form = useForm<ExerciseInput>({
    resolver: zodResolver(exerciseSchema) as never,
    defaultValues: { date, name: '', duration_min: undefined as unknown as number, calories: null }
  })

  const mutation = useMutation({
    mutationFn: api.exercises.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] })
      form.reset({ date, name: '', duration_min: undefined as unknown as number, calories: null })
      toast.success('運動を記録しました')
    }
  })

  const onSubmit = (values: ExerciseInput) => {
    mutation.mutate({ ...values, date })
  }

  return (
    <m.div
      className='p-4'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
    >
      <PageHeader title='運動を追加' back />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='mt-4 space-y-4'>
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>種目</FormLabel>
                <FormControl>
                  <Input placeholder='ランニング、筋トレなど' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='duration_min'
            render={({ field }) => (
              <FormItem>
                <FormLabel>時間 (分)</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    placeholder='30'
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
            name='calories'
            render={({ field }) => (
              <FormItem>
                <FormLabel>消費カロリー (任意)</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    placeholder='200'
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                  />
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
    </m.div>
  )
}
