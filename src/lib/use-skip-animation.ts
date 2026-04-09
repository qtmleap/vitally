import { useEffect, useState } from 'react'

/**
 * Returns true when the page was restored from bfcache (e.g. iOS swipe-back).
 * Use this to skip entry animations that have already played.
 */
export function useSkipAnimation(): boolean {
  const [skip, setSkip] = useState(false)

  useEffect(() => {
    const handler = (e: PageTransitionEvent) => {
      if (e.persisted) setSkip(true)
    }
    window.addEventListener('pageshow', handler)
    return () => window.removeEventListener('pageshow', handler)
  }, [])

  return skip
}
