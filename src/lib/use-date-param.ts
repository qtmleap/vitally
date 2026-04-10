'use client'

import { useCallback, useState } from 'react'

import { today } from '@/lib/date'

function getInitialDate(): string {
  if (typeof window === 'undefined') return today()
  const urlDate = new URLSearchParams(window.location.search).get('date')
  return urlDate && /^\d{4}-\d{2}-\d{2}$/.test(urlDate) ? urlDate : today()
}

/**
 * URL の ?date= パラメータと同期する日付 state。
 * 初期値は URL から読み取り、変更時は URL を書き換える。
 */
export function useDateParam(): [string, (date: string) => void] {
  const [date, setDate] = useState(getInitialDate)

  const setDateAndUrl = useCallback((next: string) => {
    setDate(next)
    const url = new URL(window.location.href)
    url.searchParams.set('date', next)
    window.history.replaceState(null, '', url.toString())
  }, [])

  return [date, setDateAndUrl]
}
