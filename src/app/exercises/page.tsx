'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { Plus, Trash2 } from 'lucide-react'
import Link from 'vinext/shims/link'
import { DateNav } from '@/components/date-nav'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { api } from '@/lib/api'
import { selectedDateAtom } from '@/lib/atoms'
import type { ExerciseRow } from '@/lib/db'

export default function ExercisesPage() {
  const date = useAtomValue(selectedDateAtom)
  const queryClient = useQueryClient()
  const { data: exercises = [] } = useQuery<ExerciseRow[]>({
    queryKey: ['exercises', date],
    queryFn: () => api.exercises.list(date)
  })
  const deleteMutation = useMutation({
    mutationFn: api.exercises.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['exercises', date] })
  })

  return (
    <div className='p-4'>
      <PageHeader title='運動記録'>
        <Button asChild size='sm'>
          <Link href='/exercises/new'>
            <Plus className='mr-1 size-4' />
            追加
          </Link>
        </Button>
      </PageHeader>
      <DateNav />
      <div className='mt-4 space-y-2'>
        {exercises.map((ex) => (
          <Card key={ex.id}>
            <CardContent className='flex items-center justify-between py-3'>
              <div>
                <p className='font-medium'>{ex.name}</p>
                <p className='text-muted-foreground text-xs'>
                  {ex.duration_min}分 {ex.calories ? `/ ${ex.calories}kcal` : ''}
                </p>
              </div>
              <Button variant='ghost' size='icon' onClick={() => deleteMutation.mutate(ex.id)}>
                <Trash2 className='size-4 text-destructive' />
              </Button>
            </CardContent>
          </Card>
        ))}
        {exercises.length === 0 && (
          <p className='text-muted-foreground py-8 text-center text-sm'>この日の運動記録はありません</p>
        )}
      </div>
    </div>
  )
}
