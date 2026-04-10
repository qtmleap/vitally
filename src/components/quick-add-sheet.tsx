'use client'

import dayjs from 'dayjs'
import { useSetAtom } from 'jotai'
import { Apple, Dumbbell, UtensilsCrossed, X } from 'lucide-react'
import { AnimatePresence } from 'motion/react'
import * as m from 'motion/react-m'
import { useRouter } from 'vinext/shims/navigation'

import { selectedDateAtom } from '@/lib/atoms'
import { today } from '@/lib/date'
import type { MealType } from '@/lib/schema'
import { cn } from '@/lib/utils'

interface QuickAddSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddMeal: (type: MealType) => void
}

function getMealTypeByTime(): MealType {
  const h = dayjs().hour()
  if (h < 10) return 'breakfast'
  if (h < 14) return 'lunch'
  if (h < 17) return 'snack'
  return 'dinner'
}

const mealTypeLabel: Record<MealType, string> = {
  breakfast: '朝食',
  lunch: '昼食',
  dinner: '夕食',
  snack: '間食'
}

export function QuickAddSheet({ open, onOpenChange, onAddMeal }: QuickAddSheetProps) {
  const router = useRouter()
  const setDate = useSetAtom(selectedDateAtom)

  const suggestedType = getMealTypeByTime()

  const actions = [
    {
      icon: UtensilsCrossed,
      label: `${mealTypeLabel[suggestedType]}を記録`,
      sub: '食事をすばやく追加',
      color: 'bg-primary text-primary-foreground',
      onClick: () => {
        setDate(today())
        onAddMeal(suggestedType)
        onOpenChange(false)
      }
    },
    {
      icon: Dumbbell,
      label: '運動を記録',
      sub: '時間とカロリーを入力',
      color: 'bg-blue-500 text-white',
      onClick: () => {
        setDate(today())
        router.push('/exercises/new')
        onOpenChange(false)
      }
    },
    {
      icon: Apple,
      label: '食品を登録',
      sub: 'バーコード・AI で簡単追加',
      color: 'bg-orange-500 text-white',
      onClick: () => {
        router.push('/foods/new')
        onOpenChange(false)
      }
    }
  ]

  return (
    <AnimatePresence>
      {open && (
        <>
          <m.div
            className='fixed inset-0 z-50 bg-black/40'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
          />
          <m.div
            className='fixed inset-x-0 bottom-0 z-50 mx-auto max-w-lg'
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 32 }}
          >
            <div className='bg-background rounded-t-3xl px-5 pb-8 pt-3'>
              <div className='bg-muted mx-auto mb-4 h-1 w-10 rounded-full' />
              <div className='mb-4 flex items-center justify-between'>
                <h2 className='text-base font-bold'>記録する</h2>
                <button
                  type='button'
                  onClick={() => onOpenChange(false)}
                  className='text-muted-foreground hover:text-foreground rounded-full p-1 transition-colors'
                >
                  <X className='size-5' />
                </button>
              </div>
              <div className='space-y-2'>
                {actions.map((action, i) => (
                  <m.button
                    key={action.label}
                    type='button'
                    onClick={action.onClick}
                    className='flex w-full items-center gap-4 rounded-2xl p-4 text-left transition-colors active:bg-muted/60'
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06, type: 'spring', stiffness: 400, damping: 24 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <div className={cn('flex size-11 items-center justify-center rounded-xl', action.color)}>
                      <action.icon className='size-5' />
                    </div>
                    <div className='flex-1'>
                      <p className='text-sm font-semibold'>{action.label}</p>
                      <p className='text-muted-foreground text-xs'>{action.sub}</p>
                    </div>
                  </m.button>
                ))}
              </div>
            </div>
          </m.div>
        </>
      )}
    </AnimatePresence>
  )
}
