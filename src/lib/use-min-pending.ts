import { useEffect, useRef, useState } from 'react'

/**
 * isPending が true になったら最低 minMs ミリ秒間は true を返す。
 * 一瞬で終わる操作でもオーバーレイが「見える」ようにする。
 */
export function useMinPending(isPending: boolean, minMs = 600): boolean {
  const [held, setHeld] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (isPending) {
      setHeld(true)
      if (timer.current) clearTimeout(timer.current)
      timer.current = null
    } else if (held) {
      timer.current = setTimeout(() => setHeld(false), minMs)
    }
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [isPending, held, minMs])

  return isPending || held
}
