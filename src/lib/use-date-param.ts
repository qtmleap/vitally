'use client'

import { useCallback, useState } from 'react'
import { useSearchParams } from 'vinext/shims/navigation'

import { today } from '@/lib/date'

/**
 * URL の ?date= パラメータと同期する日付 state。
 * 初期値は URL から読み取り（SSR でも動作）、変更時は URL を書き換える。
 */
export function useDateParam(): [string, (date: string) => void] {
  const searchParams = useSearchParams()
  const [date, setDate] = useState(() => {
    const urlDate = searchParams.get('date')
    return urlDate && /^\d{4}-\d{2}-\d{2}$/.test(urlDate) ? urlDate : today()
  })

  const setDateAndUrl = useCallback((next: string) => {
    setDate(next)
    const url = new URL(window.location.href)
    url.searchParams.set('date', next)
    window.history.replaceState(null, '', url.toString())
  }, [])

  return [date, setDateAndUrl]
}
