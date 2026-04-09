import { useEffect, useState } from 'react'

declare const __APP_VERSION__: string

const VERSION_KEY = 'app_version'

export function useVersionCheck() {
  const [hasUpdate, setHasUpdate] = useState(import.meta.env.DEV)

  useEffect(() => {
    if (import.meta.env.DEV) return
    const check = async () => {
      try {
        const res = await fetch('/api/version')
        if (!res.ok) return
        const { version } = (await res.json()) as { version: string }
        const stored = localStorage.getItem(VERSION_KEY)
        if (!stored) {
          localStorage.setItem(VERSION_KEY, version)
          return
        }
        if (stored !== version) {
          setHasUpdate(true)
        }
      } catch {
        // ignore
      }
    }
    check()
  }, [])

  const update = () => {
    localStorage.removeItem(VERSION_KEY)
    window.location.reload()
  }

  return { hasUpdate, update }
}
