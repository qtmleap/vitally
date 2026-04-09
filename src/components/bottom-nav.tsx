'use client'

import { useAtomValue } from 'jotai'
import { Apple, CalendarDays, Home, Plus, Settings } from 'lucide-react'
import * as m from 'motion/react-m'
import { useState } from 'react'
import Link from 'vinext/shims/link'

import { AddMealDialog } from '@/components/add-meal-dialog'
import { QuickAddSheet } from '@/components/quick-add-sheet'
import { selectedDateAtom } from '@/lib/atoms'
import { today } from '@/lib/date'
import type { MealType } from '@/lib/schema'

const leftNav = [
  { href: '/', label: 'ホーム', icon: Home },
  { href: '/day', label: '今日', icon: CalendarDays }
]

const rightNav = [
  { href: '/foods', label: '食品', icon: Apple },
  { href: '/settings', label: '設定', icon: Settings }
]

export function BottomNav() {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [mealDialogType, setMealDialogType] = useState<MealType | null>(null)
  const date = useAtomValue(selectedDateAtom)

  return (
    <>
      <m.nav
        className='bg-background/80 fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur-sm'
        initial={{ y: 80 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28, delay: 0.2 }}
      >
        <div className='mx-auto flex max-w-lg items-center justify-around py-2'>
          {leftNav.map(({ href, label, icon: Icon }) => (
            <m.div key={href} whileTap={{ scale: 0.85 }} whileHover={{ scale: 1.1 }}>
              <Link href={href} className='text-muted-foreground flex flex-col items-center gap-0.5 px-3 py-1'>
                <Icon className='size-5' />
                <span className='text-[10px]'>{label}</span>
              </Link>
            </m.div>
          ))}

          <m.button
            type='button'
            onClick={() => setSheetOpen(true)}
            className='bg-primary text-primary-foreground -mt-5 flex size-12 items-center justify-center rounded-full shadow-lg'
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            <Plus className='size-6' />
          </m.button>

          {rightNav.map(({ href, label, icon: Icon }) => (
            <m.div key={href} whileTap={{ scale: 0.85 }} whileHover={{ scale: 1.1 }}>
              <Link href={href} className='text-muted-foreground flex flex-col items-center gap-0.5 px-3 py-1'>
                <Icon className='size-5' />
                <span className='text-[10px]'>{label}</span>
              </Link>
            </m.div>
          ))}
        </div>
      </m.nav>

      <QuickAddSheet open={sheetOpen} onOpenChange={setSheetOpen} onAddMeal={setMealDialogType} />

      {mealDialogType && (
        <AddMealDialog
          open={!!mealDialogType}
          onOpenChange={(open) => {
            if (!open) setMealDialogType(null)
          }}
          mealType={mealDialogType}
          date={date ?? today()}
        />
      )}
    </>
  )
}
