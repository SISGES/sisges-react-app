import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import {
  login as authLogin,
  logout as authLogout,
  getCurrentUser,
  isAuthenticated,
  validateToken,
  User,
  LoginCredentials,
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

  // Verifica autenticação ao carregar
  useEffect(() => {
    async function checkAuth() {
      try {
        if (isAuthenticated()) {
          // Valida o token com o backend
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
    // O usuário já foi salvo no localStorage pelo authService
    const currentUser = getCurrentUser()
    setUser(currentUser)
    // O redirecionamento será feito no componente Login usando useNavigate
  }

  const logout = () => {
    authLogout()
    setUser(null)
    // O redirecionamento será feito no componente que chama logout usando useNavigate
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
