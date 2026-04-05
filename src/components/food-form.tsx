'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { api } from '@/lib/api'

export function FoodForm() {
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [calories, setCalories] = useState('')
  const [protein, setProtein] = useState('0')
  const [fat, setFat] = useState('0')
  const [carbs, setCarbs] = useState('0')
  const [serving, setServing] = useState('1食分')

  const mutation = useMutation({
    mutationFn: api.foods.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foods'] })
      setName('')
      setCalories('')
      setProtein('0')
      setFat('0')
      setCarbs('0')
      setServing('1食分')
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate({
      name,
      calories: Number(calories),
      protein: Number(protein),
      fat: Number(fat),
      carbs: Number(carbs),
      serving
    })
  }

  return (
    <div className='p-4'>
      <PageHeader title='食品を追加' />
      <Card>
        <CardContent className='pt-4'>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
              <Label htmlFor='name'>名前</Label>
              <Input id='name' value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor='calories'>カロリー (kcal)</Label>
              <Input
                id='calories'
                type='number'
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                required
              />
            </div>
            <div className='grid grid-cols-3 gap-2'>
              <div>
                <Label htmlFor='protein'>P (g)</Label>
                <Input id='protein' type='number' value={protein} onChange={(e) => setProtein(e.target.value)} />
              </div>
              <div>
                <Label htmlFor='fat'>F (g)</Label>
                <Input id='fat' type='number' value={fat} onChange={(e) => setFat(e.target.value)} />
              </div>
              <div>
                <Label htmlFor='carbs'>C (g)</Label>
                <Input id='carbs' type='number' value={carbs} onChange={(e) => setCarbs(e.target.value)} />
              </div>
            </div>
            <div>
              <Label htmlFor='serving'>1食分の量</Label>
              <Input id='serving' value={serving} onChange={(e) => setServing(e.target.value)} />
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
