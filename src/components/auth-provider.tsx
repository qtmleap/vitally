'use client'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { createContext, useContext, useEffect, useState } from 'react'
import { auth } from '@/lib/firebase'
import { setTokenGetter } from '@/lib/api'

interface AuthContextValue {
  user: User | null
  loading: boolean
}

const AuthContext = createContext<AuthContextValue>({ user: null, loading: true })

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
    })

    setTokenGetter(async () => {
      const currentUser = auth.currentUser
      if (!currentUser) return null
      return currentUser.getIdToken()
    })

    return unsubscribe
  }, [])

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
