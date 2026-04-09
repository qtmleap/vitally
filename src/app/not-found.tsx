'use client'

import { Home, SearchX } from 'lucide-react'
import * as m from 'motion/react-m'
import Link from 'vinext/shims/link'

import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
  return (
    <div className='flex min-h-dvh flex-col items-center justify-center px-6'>
      <m.div
        className='flex flex-col items-center gap-6 text-center'
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      >
        <m.div
          className='bg-muted flex size-20 items-center justify-center rounded-3xl'
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.1 }}
        >
          <SearchX className='text-muted-foreground size-9' />
        </m.div>
        <div>
          <p className='text-4xl font-bold'>404</p>
          <p className='text-muted-foreground mt-2 text-sm'>お探しのページが見つかりませんでした</p>
        </div>
        <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <Button asChild>
            <Link href='/'>
              <Home className='mr-2 size-4' />
              ホームに戻る
            </Link>
          </Button>
        </m.div>
      </m.div>
    </div>
  )
}
