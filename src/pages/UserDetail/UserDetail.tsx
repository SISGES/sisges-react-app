import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { BackButton } from '../../components/BackButton/BackButton'
import { getUserById } from '../../services/userService'
import { ApiError } from '../../services/api'
import type { UserDetailResponse } from '../../types/auth'
import './UserDetail.css'

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrador',
  TEACHER: 'Professor',
  STUDENT: 'Aluno',
}

export function UserDetail() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [user, setUser] = useState<UserDetailResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchUser() {
      if (!id) return

      setIsLoading(true)
      setError(null)
      try {
        const data = await getUserById(parseInt(id, 10))
        setUser(data)
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message)
        } else if (err instanceof Error) {
          setError(err.message)
        } else {
          setError('Erro ao carregar dados do usuário.')
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [id])

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '-'
    const [year, month, day] = dateStr.split('-')
    return `${day}/${month}/${year}`
  }

  return (
    <div className="user-detail-container">
      <header className="user-detail-header">
        <div className="user-detail-header-content">
          <BackButton to="/" />
          <h1>Detalhes do Usuário</h1>
        </div>
      </header>

      <div className="user-detail-content">
        {isLoading ? (
          <div className="user-detail-loading">
            <div className="loading-spinner"></div>
            <span>Carregando...</span>
          </div>
        ) : error ? (
          <div className="user-detail-error">
            <p>{error}</p>
            <button onClick={() => navigate('/')} className="btn-primary">
              Voltar ao painel
            </button>
          </div>
        ) : user ? (
          <div className="user-detail-card">
            <div className="user-detail-avatar">
              <span className="avatar-initials">
                {user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
              </span>
            </div>

            <h2 className="user-detail-name">{user.name}</h2>
            <span className={`role-badge role-${user.role.toLowerCase()}`}>
              {ROLE_LABELS[user.role] || user.role}
            </span>

            <div className="user-detail-info">
              <div className="info-row">
                <span className="info-label">E-mail</span>
                <span className="info-value">{user.email}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Matrícula</span>
                <span className="info-value">{user.register}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Gênero</span>
                <span className="info-value">{user.gender}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Data de Nascimento</span>
                <span className="info-value">{formatDate(user.birthDate)}</span>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
