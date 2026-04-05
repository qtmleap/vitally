import type { ReactNode } from 'react'
import { Providers } from '@/components/providers'
import '@/index.css'

export const metadata = {
  title: 'Vinext App',
  description: 'Vinext + Cloudflare Workers template'
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <meta charSet="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, viewport-fit=cover"
        />
        <link rel="icon" type="image/svg+xml" href="/favicon.ico" />
      </head>
      <body className="bg-background text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
