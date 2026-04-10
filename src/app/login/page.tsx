'use client'

import { useEffect } from 'react'
import { useRouter } from 'vinext/shims/navigation'

export default function LoginRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/')
  }, [router])
  return null
}
