import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiInfo, FiPlus } from 'react-icons/fi'
import { BackButton } from '../../components/BackButton/BackButton'
import { searchAulas, searchClasses, getDisciplines, searchTeachers } from '../../services/userService'
import { ApiError } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import type {
  AulaSearchResponse,
  AulaSearchFilters,
  ClassSearchResponse,
  DisciplineResponse,
  TeacherSearchResponse,
} from '../../types/auth'
import './Aulas.css'

export function Aulas() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [aulas, setAulas] = useState<AulaSearchResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<AulaSearchFilters>({})
  const [schoolClasses, setSchoolClasses] = useState<ClassSearchResponse[]>([])
  const [disciplines, setDisciplines] = useState<DisciplineResponse[]>([])
  const [teachers, setTeachers] = useState<TeacherSearchResponse[]>([])

  const isAdmin = user?.role === 'ADMIN'
  const isTeacher = user?.role === 'TEACHER'

  const fetchAulas = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await searchAulas(filters)
      setAulas(data)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Erro ao carregar aulas.')
      }
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  const fetchOptions = useCallback(async () => {
    if (!isAdmin) return
    try {
      const [classesData, disciplinesData, teachersData] = await Promise.all([
        searchClasses(),
        getDisciplines(),
        searchTeachers(),
      ])
      setSchoolClasses(classesData)
      setDisciplines(disciplinesData)
      setTeachers(teachersData)
    } catch {
      void 0
    }
  }, [isAdmin])

  useEffect(() => {
    fetchAulas()
  }, [fetchAulas])

  useEffect(() => {
    fetchOptions()
  }, [fetchOptions])

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString('pt-BR')
    } catch {
      return dateStr
    }
  }

  return (
    <div className="aulas-container">
      <header className="aulas-header">
        <div className="aulas-header-content">
          <BackButton to="/" />
          <h1>Aulas</h1>
        </div>
      </header>

      <div className="aulas-content">
        <div className="aulas-card">
          <div className="aulas-card-header">
            <h3 className="aulas-card-title">Lista de Aulas</h3>
            <div className="aulas-card-actions">
              {isTeacher && (
                <button
                  type="button"
                  onClick={() => navigate('/aulas/new')}
                  className="app-icon-btn app-icon-btn--add app-icon-btn--text"
                  title="Nova aula"
                  aria-label="Nova aula"
                >
                  <FiPlus size={18} strokeWidth={2.25} />
                  <span>Nova aula</span>
                </button>
              )}
            </div>
          </div>

          {isAdmin && (
            <div className="aulas-filters">
              <div className="filter-row">
                <input
                  type="date"
                  value={filters.date || ''}
                  onChange={(e) => setFilters((prev) => ({ ...prev, date: e.target.value || undefined }))}
                  className="form-input filter-input"
                />
                <select
                  value={filters.disciplineId ?? ''}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      disciplineId: e.target.value ? parseInt(e.target.value, 10) : undefined,
                    }))
                  }
                  className="form-select filter-select"
                >
                  <option value="">Todas as disciplinas</option>
                  {disciplines.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
                <select
                  value={filters.schoolClassId ?? ''}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      schoolClassId: e.target.value ? parseInt(e.target.value, 10) : undefined,
                    }))
                  }
                  className="form-select filter-select"
                >
                  <option value="">Todas as turmas</option>
                  {schoolClasses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <select
                  value={filters.teacherId ?? ''}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      teacherId: e.target.value ? parseInt(e.target.value, 10) : undefined,
                    }))
                  }
                  className="form-select filter-select"
                >
                  <option value="">Todos os professores</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setFilters({})}
                  className="btn-clear-filters"
                >
                  Limpar
                </button>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="aulas-loading">
              <div className="loading-spinner-sm"></div>
              <span>Carregando aulas...</span>
            </div>
          ) : error ? (
            <div className="aulas-error">
              <p>{error}</p>
              <button onClick={fetchAulas} className="btn-retry">
                Tentar novamente
              </button>
            </div>
          ) : aulas.length === 0 ? (
            <div className="aulas-empty">
              <p>Nenhuma aula encontrada.</p>
              {isTeacher && (
                <button
                  type="button"
                  onClick={() => navigate('/aulas/new')}
                  className="app-icon-btn app-icon-btn--add app-icon-btn--text"
                  title="Criar primeira aula"
                  aria-label="Criar primeira aula"
                >
                  <FiPlus size={18} strokeWidth={2.25} />
                  <span>Criar primeira aula</span>
                </button>
              )}
            </div>
          ) : (
            <div className="aula-table-wrapper">
              <table className="aula-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Horário</th>
                    <th>Disciplina</th>
                    <th>Turma</th>
                    <th>Professor</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {aulas.map((a) => (
                    <tr key={a.id}>
                      <td>{formatDate(a.date)}</td>
                      <td>{a.startTime} - {a.endTime}</td>
                      <td>{a.disciplineName}</td>
                      <td>{a.schoolClassName}</td>
                      <td>{a.teacherName}</td>
                      <td className="aula-actions-cell">
                        <button
                          type="button"
                          onClick={() => navigate(`/aulas/${a.id}`)}
                          className="app-icon-btn app-icon-btn--info"
                          title="Detalhes da aula"
                          aria-label="Detalhes da aula"
                        >
                          <FiInfo size={18} strokeWidth={2.25} />
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
