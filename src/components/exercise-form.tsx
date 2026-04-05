'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { useState } from 'react'

import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { api } from '@/lib/api'
import { selectedDateAtom } from '@/lib/atoms'

export function ExerciseForm() {
  const date = useAtomValue(selectedDateAtom)
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [duration, setDuration] = useState('')
  const [calories, setCalories] = useState('')

  const mutation = useMutation({
    mutationFn: api.exercises.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] })
      setName('')
      setDuration('')
      setCalories('')
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate({
      date,
      name,
      duration_min: Number(duration),
      calories: calories ? Number(calories) : null
    })
  }

  return (
    <div className='p-4'>
      <PageHeader title='運動を追加' />
      <Card>
        <CardContent className='pt-4'>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
              <Label htmlFor='name'>種目</Label>
              <Input id='name' value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor='duration'>時間 (分)</Label>
              <Input
                id='duration'
                type='number'
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor='calories'>消費カロリー (任意)</Label>
              <Input id='calories' type='number' value={calories} onChange={(e) => setCalories(e.target.value)} />
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
