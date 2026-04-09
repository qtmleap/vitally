'use client'

import { Dumbbell, Plus, UtensilsCrossed, X } from 'lucide-react'
import { AnimatePresence } from 'motion/react'
import * as m from 'motion/react-m'
import { useState } from 'react'
import Link from 'vinext/shims/link'

import type { MealType } from '@/lib/schema'

interface DayFabProps {
  defaultMealType: MealType
  onAddMeal: (type: MealType) => void
}

export function DayFab({ defaultMealType, onAddMeal }: DayFabProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className='fixed bottom-20 right-4 z-40 flex flex-col items-end gap-2'>
      <AnimatePresence>
        {open && (
          <>
            <m.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 22 }}
            >
              <button
                type='button'
                onClick={() => { onAddMeal(defaultMealType); setOpen(false) }}
                className='bg-primary text-primary-foreground flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium shadow-lg'
              >
                <UtensilsCrossed className='size-4' />
                食事を追加
              </button>
            </m.div>
            <m.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 22, delay: 0.05 }}
            >
              <Link
                href='/exercises/new'
                className='bg-blue-500 flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-white shadow-lg'
              >
                <Dumbbell className='size-4' />
                運動を追加
              </Link>
            </m.div>
          </>
        )}
      </AnimatePresence>
      <m.button
        type='button'
        onClick={() => setOpen((prev) => !prev)}
        className='bg-primary text-primary-foreground flex size-14 items-center justify-center rounded-full shadow-lg'
        whileTap={{ scale: 0.9 }}
        animate={{ rotate: open ? 45 : 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      >
        {open ? <X className='size-6' /> : <Plus className='size-6' />}
      </m.button>
    </div>
  )
}
