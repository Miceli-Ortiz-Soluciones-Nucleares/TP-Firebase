import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { User } from 'firebase/auth'
import type { AuthState } from '../types'
import { onAuthChange } from '../services/auth.service'

const AuthContext = createContext<AuthState>({
  user: null,
  isAdmin: false,
  loading: true,
})

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAdmin: false,
    loading: true,
  })

  useEffect(() => {
    const unsubscribe = onAuthChange(async (user: User | null) => {
      if (!user) {
        setState({ user: null, isAdmin: false, loading: false })
        return
      }
      const tokenResult = await user.getIdTokenResult()
      const isAdmin = tokenResult.claims['admin'] === true
      setState({ user, isAdmin, loading: false })
    })
    return unsubscribe
  }, [])

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
