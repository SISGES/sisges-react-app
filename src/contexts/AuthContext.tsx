import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import {
  login as authLogin,
  logout as authLogout,
  getCurrentUser,
  isAuthenticated,
  validateToken,
  User,
} from '../services/authService'
import type { LoginRequest } from '../types/auth'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      try {
        if (isAuthenticated()) {
          const isValid = await validateToken()
          if (isValid) {
            const currentUser = getCurrentUser()
            setUser(currentUser)
          } else {
            setUser(null)
          }
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (credentials: LoginRequest) => {
    await authLogin(credentials)
    const currentUser = getCurrentUser()
    setUser(currentUser)
  }

  const logout = () => {
    authLogout()
    setUser(null)
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
