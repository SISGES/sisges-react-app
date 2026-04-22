import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
interface TeacherRouteProps {
  children: ReactNode
}

export function TeacherRoute({ children }: TeacherRouteProps) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <p className="text-sm text-text-secondary">Carregando...</p>
      </div>
    )
  }

  const canAccess = user?.role === 'TEACHER' || user?.role === 'ADMIN'
  if (!canAccess) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
