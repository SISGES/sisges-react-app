import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import './ProtectedRoute.css'

interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="text-secondary">Carregando...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    // Redireciona para login, salvando a localização atual
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
