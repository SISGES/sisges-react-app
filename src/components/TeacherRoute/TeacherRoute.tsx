import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import '../ProtectedRoute/ProtectedRoute.css'

interface TeacherRouteProps {
  children: ReactNode
}

export function TeacherRoute({ children }: TeacherRouteProps) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="text-secondary">Carregando...</p>
      </div>
    )
  }

  const canAccess = user?.role === 'TEACHER' || user?.role === 'ADMIN'
  if (!canAccess) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
