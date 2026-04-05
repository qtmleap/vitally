'use client'

import { Provider as JotaiProvider } from 'jotai'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useState } from 'react'

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000
          }
        }
      })
  )

  return (
    <JotaiProvider>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </JotaiProvider>
  )
}
