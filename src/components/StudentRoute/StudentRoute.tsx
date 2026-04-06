import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import '../ProtectedRoute/ProtectedRoute.css'

interface StudentRouteProps {
  children: ReactNode
}

export function StudentRoute({ children }: StudentRouteProps) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="text-secondary">Carregando...</p>
      </div>
    )
  }

  if (user?.role?.toUpperCase() !== 'STUDENT') {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
