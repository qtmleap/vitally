'use client'

import { Moon, Sun } from 'lucide-react'

import { PageHeader } from '@/components/page-header'
import { useDarkMode } from '@/components/providers'
import { Card, CardContent } from '@/components/ui/card'

export default function SettingsPage() {
  const { dark, toggle } = useDarkMode()

  return (
    <div className='p-4'>
      <PageHeader title='設定' />
      <div className='mt-4 space-y-4'>
        <Card>
          <CardContent className='py-3'>
            <button type='button' onClick={toggle} className='flex w-full items-center justify-between'>
              <div className='flex items-center gap-3'>
                {dark ? <Moon className='size-5' /> : <Sun className='size-5' />}
                <span className='text-sm font-medium'>テーマ</span>
              </div>
              <span className='text-muted-foreground text-sm'>{dark ? 'ダーク' : 'ライト'}</span>
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
