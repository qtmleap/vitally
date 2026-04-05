import type { ReactNode } from 'react'

import { BottomNav } from '@/components/bottom-nav'
import { Providers } from '@/components/providers'
import '@/index.css'

export const metadata = {
  title: 'HealthLog',
  description: '毎日の食事と運動を記録して健康管理'
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang='ja' suppressHydrationWarning>
      <head>
        <meta charSet='UTF-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1.0, viewport-fit=cover, maximum-scale=1' />
        <meta name='theme-color' content='#22c55e' />
        <link rel='icon' type='image/svg+xml' href='/favicon.ico' />
      </head>
      <body className='bg-background text-foreground antialiased'>
        <Providers>
          <div className='mx-auto min-h-dvh max-w-lg pb-20'>{children}</div>
          <BottomNav />
        </Providers>
      </body>
    </html>
  )
}
