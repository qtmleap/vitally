import type { ReactNode } from 'react'

import { BottomNav } from '@/components/bottom-nav'
import { ErrorBoundary } from '@/components/error-boundary'
import { Providers } from '@/components/providers'
import { ConditionalAuthGuard } from '@/components/conditional-auth-guard'
import { Toaster } from '@/components/ui/sonner'
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
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme:dark)').matches))document.documentElement.classList.add('dark')}catch(e){}})()`
          }}
        />
        <meta name='theme-color' content='#22c55e' />
        <link rel='icon' type='image/svg+xml' href='/favicon.ico' />
        <link rel='manifest' href='/manifest.json' />
        <meta name='mobile-web-app-capable' content='yes' />
        <meta name='apple-mobile-web-app-status-bar-style' content='default' />
        <link rel='apple-touch-icon' href='/icon-192.svg' />
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator)navigator.serviceWorker.register('/sw.js')`
          }}
        />
      </head>
      <body className='bg-background text-foreground antialiased'>
        <Providers>
          <ConditionalAuthGuard
            authenticated={
              <>
                <div className='mx-auto min-h-dvh max-w-lg pb-20'>
                  <ErrorBoundary>{children}</ErrorBoundary>
                </div>
                <BottomNav />
              </>
            }
            unauthenticated={
              <div className='mx-auto min-h-dvh max-w-lg'>
                <ErrorBoundary>{children}</ErrorBoundary>
              </div>
            }
          />
          <Toaster position='top-center' />
        </Providers>
      </body>
    </html>
  )
}
