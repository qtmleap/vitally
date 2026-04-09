'use client'

import { ChevronLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { useRouter } from 'vinext/shims/navigation'

export function PageHeader({ title, back, children }: { title: string; back?: boolean; children?: ReactNode }) {
  const router = useRouter()
  return (
    <div className='mb-4 flex items-center justify-between'>
      <div className='flex items-center gap-1'>
        {back && (
          <button
            type='button'
            onClick={() => router.back()}
            className='text-muted-foreground hover:text-foreground -ml-2 rounded-lg p-1.5 transition-colors'
            aria-label='戻る'
          >
            <ChevronLeft className='size-5' />
          </button>
        )}
        <h1 className='text-xl font-bold'>{title}</h1>
      </div>
      {children}
    </div>
  )
}
