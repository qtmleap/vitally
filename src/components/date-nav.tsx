'use client'

import dayjs from 'dayjs'
import { useAtom } from 'jotai'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import * as m from 'motion/react-m'

import { Button } from '@/components/ui/button'
import { selectedDateAtom } from '@/lib/atoms'

interface DateNavProps {
  date?: string
  onDateChange?: (date: string) => void
}

export function DateNav({ date: dateProp, onDateChange }: DateNavProps = {}) {
  const [atomDate, setAtomDate] = useAtom(selectedDateAtom)
  const date = dateProp ?? atomDate
  const setDate = onDateChange ?? setAtomDate
  const d = dayjs(date)

  const goBack = () => setDate(d.subtract(1, 'day').format('YYYY-MM-DD'))
  const goForward = () => setDate(d.add(1, 'day').format('YYYY-MM-DD'))

  return (
    <div className='flex items-center justify-center gap-2'>
      <m.div whileTap={{ scale: 0.85, x: -4 }}>
        <Button variant='ghost' size='icon' onClick={goBack}>
          <ChevronLeft className='size-4' />
        </Button>
      </m.div>
      <div className='min-w-[120px] text-center'>
        <span className='block font-medium tabular-nums'>{d.format('YYYY/MM/DD')}</span>
      </div>
      <m.div whileTap={{ scale: 0.85, x: 4 }}>
        <Button variant='ghost' size='icon' onClick={goForward}>
          <ChevronRight className='size-4' />
        </Button>
      </m.div>
    </div>
  )
}
