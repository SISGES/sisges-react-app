import { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  searchUsers,
  searchClasses,
  getDisciplines,
} from '../../services/userService'
import { ApiError } from '../../services/api'
import './AdminDashboard.css'

interface AdminDashboardProps {
  currentUserId: number
}

export function AdminDashboard({ currentUserId }: AdminDashboardProps) {
  const [studentsCount, setStudentsCount] = useState(0)
  const [classesCount, setClassesCount] = useState(0)
  const [disciplinesCount, setDisciplinesCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [usersData, classesData, disciplinesData] = await Promise.all([
        searchUsers(),
        searchClasses(),
        getDisciplines(),
      ])
      const students = usersData.filter((u) => u.role === 'STUDENT' && u.id !== currentUserId)
      setStudentsCount(students.length)
      setClassesCount(classesData.length)
      setDisciplinesCount(disciplinesData.length)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Erro ao carregar dados.')
      }
    } finally {
      setIsLoading(false)
    }
  }, [currentUserId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (isLoading) {
    return (
      <div className="admin-dashboard">
        <div className="dashboard-header">
          <h2 className="dashboard-title">Painel de Controle</h2>
          <div className="dashboard-header-actions">
            <button onClick={() => navigate('/admin/announcements')} className="btn-manage-announcements">
              Avisos
            </button>
            <button onClick={() => navigate('/admin/classes')} className="btn-manage-classes">
              Gerenciar Turmas
            </button>
            <button onClick={() => navigate('/admin/register')} className="btn-add-user">
              + Cadastrar Usuário
            </button>
          </div>
        </div>
        <div className="dashboard-loading hub-loading">
          <div className="loading-spinner-sm"></div>
          <span>Carregando...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="dashboard-header">
          <h2 className="dashboard-title">Painel de Controle</h2>
        </div>
        <div className="dashboard-error hub-error">
          <p>{error}</p>
          <button onClick={fetchData} className="btn-retry">
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h2 className="dashboard-title">Painel de Controle</h2>
        <div className="dashboard-header-actions">
          <button onClick={() => navigate('/admin/announcements')} className="btn-manage-announcements">
            Avisos
          </button>
          <button onClick={() => navigate('/admin/classes')} className="btn-manage-classes">
            Gerenciar Turmas
          </button>
          <button onClick={() => navigate('/admin/register')} className="btn-add-user">
            + Cadastrar Usuário
          </button>
        </div>
      </div>

      <div className="dashboard-hub">
        <Link
          to="/admin/students"
          className="hub-card hub-card-shortcut"
        >
          <h3 className="hub-card-title">Alunos</h3>
          <span className="hub-card-count">{studentsCount}</span>
          <span className="hub-card-action">Ver alunos →</span>
        </Link>

        <Link
          to="/admin/classes"
          className="hub-card hub-card-shortcut"
        >
          <h3 className="hub-card-title">Turmas</h3>
          <span className="hub-card-count">{classesCount}</span>
          <span className="hub-card-action">Gerenciar turmas →</span>
        </Link>

        <Link
          to="/admin/disciplines"
          className="hub-card hub-card-shortcut"
        >
          <h3 className="hub-card-title">Disciplinas</h3>
          <span className="hub-card-count">{disciplinesCount}</span>
          <span className="hub-card-action">Ver disciplinas →</span>
        </Link>

        <Link
          to="/admin/announcements"
          className="hub-card hub-card-shortcut"
        >
          <h3 className="hub-card-title">Avisos</h3>
          <span className="hub-card-action">Gerenciar avisos →</span>
        </Link>

        <Link
          to="/aulas"
          className="hub-card hub-card-shortcut"
        >
          <h3 className="hub-card-title">Aulas</h3>
          <span className="hub-card-action">Gerenciar aulas →</span>
        </Link>
      </div>
    </div>
  )
}
