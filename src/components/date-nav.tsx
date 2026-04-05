'use client'

import dayjs from 'dayjs'
import { useAtom } from 'jotai'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { selectedDateAtom } from '@/lib/atoms'

export function DateNav() {
  const [date, setDate] = useAtom(selectedDateAtom)
  const d = dayjs(date)

  return (
    <div className='flex items-center justify-center gap-2'>
      <Button variant='ghost' size='icon' onClick={() => setDate(d.subtract(1, 'day').format('YYYY-MM-DD'))}>
        <ChevronLeft className='size-4' />
      </Button>
      <span className='min-w-[120px] text-center font-medium'>{d.format('YYYY/MM/DD')}</span>
      <Button variant='ghost' size='icon' onClick={() => setDate(d.add(1, 'day').format('YYYY-MM-DD'))}>
        <ChevronRight className='size-4' />
      </Button>
    </div>
  )
}
