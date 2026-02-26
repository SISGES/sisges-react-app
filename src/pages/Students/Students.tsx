import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiEye } from 'react-icons/fi'
import { BackButton } from '../../components/BackButton/BackButton'
import { searchUsers } from '../../services/userService'
import { ApiError } from '../../services/api'
import type { UserSearchResponse } from '../../types/auth'
import './Students.css'

export function Students() {
  const navigate = useNavigate()
  const [students, setStudents] = useState<UserSearchResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStudents = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await searchUsers()
      const filtered = data.filter((u) => u.role === 'STUDENT')
      setStudents(filtered)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Erro ao carregar alunos.')
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  return (
    <div className="students-container">
      <header className="students-header">
        <div className="students-header-content">
          <BackButton to="/" />
          <h1>Alunos</h1>
        </div>
      </header>

      <div className="students-content">
        <div className="students-card">
          <div className="students-card-header">
            <h3 className="students-card-title">Alunos Cadastrados</h3>
            {!isLoading && !error && (
              <span className="student-count">
                {students.length} aluno{students.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="students-loading">
              <div className="loading-spinner-sm"></div>
              <span>Carregando alunos...</span>
            </div>
          ) : error ? (
            <div className="students-error">
              <p>{error}</p>
              <button onClick={fetchStudents} className="btn-retry">
                Tentar novamente
              </button>
            </div>
          ) : students.length === 0 ? (
            <div className="students-empty">
              <p>Nenhum aluno cadastrado.</p>
            </div>
          ) : (
            <div className="student-table-wrapper">
              <table className="student-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>E-mail</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s.id}>
                      <td>{s.name}</td>
                      <td>{s.email}</td>
                      <td>
                        <button
                          onClick={() => navigate(`/admin/users/${s.id}`)}
                          className="btn-details"
                          title="Ver detalhes"
                          aria-label="Ver detalhes"
                        >
                          <FiEye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
