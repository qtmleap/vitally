'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LazyMotion, domAnimation } from 'motion/react'
import { Provider as JotaiProvider } from 'jotai'
import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'

function useDarkMode() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const isDark = stored === 'dark' || (!stored && prefersDark)
    setDark(isDark)
    document.documentElement.classList.toggle('dark', isDark)
  }, [])

  const toggle = () => {
    setDark((prev) => {
      const next = !prev
      localStorage.setItem('theme', next ? 'dark' : 'light')
      document.documentElement.classList.toggle('dark', next)
      return next
    })
  }

  return { dark, toggle }
}

export { useDarkMode }

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

  useEffect(() => {
    document.documentElement.dataset.hydrated = ''
  }, [])

  return (
    <LazyMotion features={domAnimation} strict>
      <JotaiProvider>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </JotaiProvider>
    </LazyMotion>
  )
}
