import { useState, useEffect, useCallback } from 'react'
import { getUsers } from '../../services/userService'
import type { UserResponse } from '../../types/auth'
import './AdminDashboard.css'

interface AdminDashboardProps {
  currentUserId: number
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrador',
  TEACHER: 'Professor',
  STUDENT: 'Aluno',
}

const ROLE_CSS: Record<string, string> = {
  ADMIN: 'role-admin',
  TEACHER: 'role-teacher',
  STUDENT: 'role-student',
}

export function AdminDashboard({ currentUserId }: AdminDashboardProps) {
  const [users, setUsers] = useState<UserResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getUsers()
      // Exclui o usuário logado da lista
      const filtered = data.filter((u) => u.id !== currentUserId)
      setUsers(filtered)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar usuários.')
    } finally {
      setIsLoading(false)
    }
  }, [currentUserId])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '-'
    const [year, month, day] = dateStr.split('-')
    return `${day}/${month}/${year}`
  }

  return (
    <div className="admin-dashboard">
      <h2 className="dashboard-title">Painel de Controle</h2>

      <div className="dashboard-card">
        <div className="dashboard-card-header">
          <h3 className="dashboard-card-title">Usuários Cadastrados</h3>
          {!isLoading && !error && (
            <span className="user-count">{users.length} usuário{users.length !== 1 ? 's' : ''}</span>
          )}
        </div>

        {isLoading ? (
          <div className="dashboard-loading">
            <div className="loading-spinner-sm"></div>
            <span>Carregando usuários...</span>
          </div>
        ) : error ? (
          <div className="dashboard-error">
            <p>{error}</p>
            <button onClick={fetchUsers} className="btn-retry">
              Tentar novamente
            </button>
          </div>
        ) : users.length === 0 ? (
          <div className="dashboard-empty">
            <p>Nenhum outro usuário cadastrado.</p>
          </div>
        ) : (
          <div className="user-table-wrapper">
            <table className="user-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Registro</th>
                  <th>Tipo</th>
                  <th className="col-gender">Gênero</th>
                  <th className="col-birthdate">Nascimento</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.register}</td>
                    <td>
                      <span className={`role-badge ${ROLE_CSS[u.role] || ''}`}>
                        {ROLE_LABELS[u.role] || u.role}
                      </span>
                    </td>
                    <td className="col-gender">{u.gender}</td>
                    <td className="col-birthdate">{formatDate(u.birthDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
