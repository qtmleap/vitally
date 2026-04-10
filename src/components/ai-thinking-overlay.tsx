'use client'

import { Sparkles } from 'lucide-react'
import { AnimatePresence } from 'motion/react'
import * as m from 'motion/react-m'

interface AiThinkingOverlayProps {
  show: boolean
  message?: string
}

export function AiThinkingOverlay({ show, message = 'AI が考えています...' }: AiThinkingOverlayProps) {
  return (
    <AnimatePresence>
      {show && (
        <m.div
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <m.div
            className='flex flex-col items-center gap-4'
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <div className='relative flex size-16 items-center justify-center'>
              <m.div
                className='absolute inset-0 rounded-full bg-primary/20'
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
              />
              <m.div
                className='absolute inset-1 rounded-full bg-primary/15'
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut', delay: 0.3 }}
              />
              <m.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
              >
                <Sparkles className='text-primary size-7' />
              </m.div>
            </div>
            <div className='text-center'>
              <m.p
                className='text-sm font-medium text-white'
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
              >
                {message}
              </m.p>
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  )
}
