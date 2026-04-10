'use client'

import { useAtom } from 'jotai'
import { useEffect, useRef } from 'react'

import { selectedDateAtom } from '@/lib/atoms'
import { today } from '@/lib/date'

function getDateFromUrl(): string | null {
  if (typeof window === 'undefined') return null
  const params = new URLSearchParams(window.location.search)
  const d = params.get('date')
  return d && /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : null
}

/**
 * URL の ?date= パラメータと selectedDateAtom を双方向同期する。
 */
export function useDateParam() {
  const [date, setDate] = useAtom(selectedDateAtom)
  const initialized = useRef(false)

  // 初回のみ: URL の ?date= から atom を同期的に設定
  if (!initialized.current) {
    initialized.current = true
    const urlDate = getDateFromUrl()
    if (urlDate && urlDate !== date) {
      setDate(urlDate)
    }
  }

  // atom 変更時に URL を更新
  useEffect(() => {
    const url = new URL(window.location.href)
    const current = url.searchParams.get('date')
    if (date && date !== current) {
      url.searchParams.set('date', date)
      window.history.replaceState(null, '', url.toString())
    }
  }, [date])

  return date || today()
}
