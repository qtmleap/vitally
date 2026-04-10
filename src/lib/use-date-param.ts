'use client'

import { useAtom } from 'jotai'
import { useEffect } from 'react'
import { useSearchParams } from 'vinext/shims/navigation'

import { selectedDateAtom } from '@/lib/atoms'
import { today } from '@/lib/date'

/**
 * URL の ?date= パラメータと selectedDateAtom を双方向同期する。
 * 初回は URL から atom を設定し、atom 変更時に URL を更新する。
 */
export function useDateParam() {
  const [date, setDate] = useAtom(selectedDateAtom)
  const searchParams = useSearchParams()

  // 初回: URL の ?date= から atom を設定 (マウント時のみ実行)
  // biome-ignore lint/correctness/useExhaustiveDependencies: mount-only effect to read initial URL param
  useEffect(() => {
    const urlDate = searchParams.get('date')
    if (urlDate && /^\d{4}-\d{2}-\d{2}$/.test(urlDate)) {
      setDate(urlDate)
    }
  }, [])

  // atom 変更時に URL を更新（ナビゲーションを発生させずに URL だけ書き換え）
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
