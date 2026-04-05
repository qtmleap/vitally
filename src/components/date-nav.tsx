'use client'

import dayjs from 'dayjs'
import { useAtom } from 'jotai'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { AnimatePresence } from 'motion/react'
import * as m from 'motion/react-m'
import { useRef } from 'react'

import { Button } from '@/components/ui/button'
import { selectedDateAtom } from '@/lib/atoms'

export function DateNav() {
  const [date, setDate] = useAtom(selectedDateAtom)
  const d = dayjs(date)
  const dirRef = useRef(1)

  const goBack = () => {
    dirRef.current = -1
    setDate(d.subtract(1, 'day').format('YYYY-MM-DD'))
  }
  const goForward = () => {
    dirRef.current = 1
    setDate(d.add(1, 'day').format('YYYY-MM-DD'))
  }

  return (
    <div className='flex items-center justify-center gap-2'>
      <m.div whileTap={{ scale: 0.85, x: -4 }}>
        <Button variant='ghost' size='icon' onClick={goBack}>
          <ChevronLeft className='size-4' />
        </Button>
      </m.div>
      <div className='relative min-w-[120px] overflow-hidden text-center'>
        <AnimatePresence mode='popLayout' initial={false}>
          <m.span
            key={date}
            className='block font-medium tabular-nums'
            initial={{ x: dirRef.current * 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: dirRef.current * -40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            {d.format('YYYY/MM/DD')}
          </m.span>
        </AnimatePresence>
      </div>
      <m.div whileTap={{ scale: 0.85, x: 4 }}>
        <Button variant='ghost' size='icon' onClick={goForward}>
          <ChevronRight className='size-4' />
        </Button>
      </m.div>
    </div>
  )
}
