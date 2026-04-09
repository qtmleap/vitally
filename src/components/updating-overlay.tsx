'use client'

import { AnimatePresence } from 'motion/react'
import * as m from 'motion/react-m'
import { Loader2 } from 'lucide-react'

interface UpdatingOverlayProps {
  show: boolean
  message?: string
}

export function UpdatingOverlay({ show, message = '更新中...' }: UpdatingOverlayProps) {
  return (
    <AnimatePresence>
      {show && (
        <m.div
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <m.div
            className='flex flex-col items-center gap-3'
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <m.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
            >
              <Loader2 className='text-primary size-8' />
            </m.div>
            <m.p
              className='text-sm font-medium text-white'
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
            >
              {message}
            </m.p>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  )
}
