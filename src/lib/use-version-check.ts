import { useEffect, useState } from 'react'

declare const __APP_VERSION__: string

const VERSION_KEY = 'app_version'

export function useVersionCheck() {
  const [hasUpdate, setHasUpdate] = useState(import.meta.env.DEV)
  const [updating, setUpdating] = useState(false)

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

  const update = async () => {
    setUpdating(true)

    // SW を更新してキャッシュを全削除
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration()
      if (reg) await reg.update()
    }
    const keys = await caches.keys()
    await Promise.all(keys.map((k) => caches.delete(k)))

    localStorage.removeItem(VERSION_KEY)

    // プログレスバーのアニメーション分だけ待ってからリロード
    setTimeout(() => window.location.reload(), 2000)
  }

  return { hasUpdate, updating, update }
}
