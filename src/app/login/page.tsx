'use client'

import { useRouter } from 'vinext/shims/navigation'
import { useEffect } from 'react'

export default function LoginRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/')
  }, [router])
  return null
}
