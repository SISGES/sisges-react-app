import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FiEdit2, FiInfo, FiPlus, FiTrash2 } from 'react-icons/fi'
import { IoClose } from 'react-icons/io5'
import { BackButton } from '../../components/BackButton/BackButton'
import {
  getAulaById,
  deleteAula,
  submitAulaFrequency,
} from '../../services/userService'
import {
  getActivitiesByMeeting,
  createActivity,
  deleteActivity,
} from '../../services/activityService'
import { uploadFile } from '../../services/uploadService'
import type { EvaluativeActivity } from '../../services/activityService'
import { ApiError } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import type { AulaDetailResponse } from '../../types/auth'
import './AulaDetail.css'

export function AulaDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const aulaId = id ? parseInt(id, 10) : null

  const [aula, setAula] = useState<AulaDetailResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [attendance, setAttendance] = useState<Record<number, 'P' | 'F'>>({})
  const [isSubmittingFreq, setIsSubmittingFreq] = useState<number | null>(null)
  const [activities, setActivities] = useState<EvaluativeActivity[]>([])
  const [showActivityModal, setShowActivityModal] = useState(false)
  const [activityTitle, setActivityTitle] = useState('')
  const [activityDesc, setActivityDesc] = useState('')
  const [activityFile, setActivityFile] = useState<File | null>(null)
  const [isSubmittingActivity, setIsSubmittingActivity] = useState(false)
  const [activityError, setActivityError] = useState<string | null>(null)

  const isAdmin = user?.role === 'ADMIN'
  const canEdit = user?.role === 'TEACHER' || user?.role === 'ADMIN'

  const fetchActivities = useCallback(async () => {
    if (!aulaId) return
    try {
      const list = await getActivitiesByMeeting(aulaId)
      setActivities(list)
    } catch {
      setActivities([])
    }
  }, [aulaId])

  useEffect(() => {
    if (!aulaId || isNaN(aulaId)) return
    let cancelled = false
    async function fetchAula() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getAulaById(aulaId!)
        if (!cancelled) {
          setAula(data)
          fetchActivities()
          const initial: Record<number, 'P' | 'F'> = {}
          ;(data.students ?? []).forEach((s) => {
            const status = s.present === true ? 'P' : s.present === false ? 'F' : 'P'
            initial[s.id] = status
          })
          setAttendance(initial)
        }
      } catch (err) {
        if (!cancelled) {
          if (err instanceof ApiError) {
            setError(err.message)
          } else if (err instanceof Error) {
            setError(err.message)
          } else {
            setError('Erro ao carregar detalhes da aula.')
          }
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    fetchAula()
    return () => {
      cancelled = true
    }
  }, [aulaId, fetchActivities])

  const handleDelete = async () => {
    if (!aulaId || !isAdmin) return
    setIsDeleting(true)
    try {
      await deleteAula(aulaId)
      setDeleteConfirm(false)
      navigate('/aulas')
    } catch (err) {
      if (err instanceof ApiError) {
        alert(err.message)
      } else if (err instanceof Error) {
        alert(err.message)
      } else {
        alert('Erro ao excluir aula.')
      }
    } finally {
      setIsDeleting(false)
    }
  }

  const handleToggleAttendance = async (studentId: number, newStatus: 'P' | 'F') => {
    if (!aulaId || !aula) return
    setIsSubmittingFreq(studentId)
    const prevStatus = attendance[studentId] ?? 'P'
    setAttendance((prev) => ({ ...prev, [studentId]: newStatus }))
    try {
      await submitAulaFrequency(aulaId, {
        entries: [{ studentId, status: newStatus }],
      })
    } catch (err) {
      setAttendance((prev) => ({ ...prev, [studentId]: prevStatus }))
      alert(err instanceof ApiError ? err.message : 'Erro ao atualizar frequência.')
    } finally {
      setIsSubmittingFreq(null)
    }
  }

  const handleSubmitActivity = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!aulaId || !activityTitle.trim()) return
    setIsSubmittingActivity(true)
    setActivityError(null)
    try {
      let filePath: string | undefined
      if (activityFile) {
        const { path } = await uploadFile(activityFile, 'activities')
        filePath = path
      }
      await createActivity({
        classMeetingId: aulaId,
        title: activityTitle.trim(),
        description: activityDesc.trim() || undefined,
        filePath,
      })
      setActivityTitle('')
      setActivityDesc('')
      setActivityFile(null)
      setShowActivityModal(false)
      fetchActivities()
    } catch (err) {
      setActivityError(err instanceof Error ? err.message : 'Erro ao criar atividade.')
    } finally {
      setIsSubmittingActivity(false)
    }
  }

  const handleDeleteActivity = async (id: number) => {
    if (!window.confirm('Excluir esta atividade?')) return
    try {
      await deleteActivity(id)
      fetchActivities()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao excluir.')
    }
  }

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'
  const UPLOAD_BASE = API_BASE.replace('/api', '')
  const getFileUrl = (path: string | null) =>
    path ? (path.startsWith('http') ? path : `${UPLOAD_BASE}${path}`) : null

  if (!aulaId || isNaN(aulaId)) {
    return (
      <div className="aula-detail-container">
        <p>ID inválido.</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="aula-detail-container">
        <div className="aula-detail-loading">
          <div className="loading-spinner"></div>
          <span>Carregando...</span>
        </div>
      </div>
    )
  }

  if (error || !aula) {
    return (
      <div className="aula-detail-container">
        <header className="aula-detail-header">
          <BackButton to="/aulas" />
        </header>
        <div className="aula-detail-error">
          <p>{error || 'Aula não encontrada.'}</p>
          <button onClick={() => navigate('/aulas')} className="btn-secondary">
            Voltar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="aula-detail-container">
      <header className="aula-detail-header">
        <div className="aula-detail-header-content">
          <BackButton to="/aulas" />
          <h1>Detalhes da Aula</h1>
          <div className="aula-detail-actions app-icon-btn-row">
            {canEdit && (
              <button
                type="button"
                onClick={() => navigate(`/aulas/${aulaId}/edit`)}
                className="app-icon-btn app-icon-btn--edit"
                title="Editar aula"
                aria-label="Editar aula"
              >
                <FiEdit2 size={18} strokeWidth={2.25} />
              </button>
            )}
            {isAdmin && (
              <button
                type="button"
                onClick={() => setDeleteConfirm(true)}
                className="app-icon-btn app-icon-btn--delete"
                disabled={isDeleting}
                title="Excluir aula"
                aria-label="Excluir aula"
              >
                <FiTrash2 size={18} strokeWidth={2.25} />
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="aula-detail-content">
        <div className="aula-detail-card">
          <h2>{aula.name}</h2>
          <p className="aula-academic-year">{aula.academicYear}</p>

          <div className="aula-section">
            <h3>Professor</h3>
            <div className="aula-professor">
              <span>{aula.professor.name}</span>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => navigate(`/users/${aula.professor.id}`)}
                  className="app-icon-btn app-icon-btn--info"
                  aria-label="Ver detalhes do professor"
                  title="Ver detalhes"
                >
                  <FiInfo size={18} strokeWidth={2.25} aria-hidden />
                </button>
              )}
            </div>
          </div>

          {canEdit && (
            <div className="aula-section">
              <div className="aula-section-header">
                <h3>Atividades Avaliativas</h3>
                <button
                  type="button"
                  onClick={() => setShowActivityModal(true)}
                  className="app-icon-btn app-icon-btn--add app-icon-btn--text"
                  title="Nova atividade"
                  aria-label="Nova atividade"
                >
                  <FiPlus size={18} strokeWidth={2.25} />
                  <span>Nova atividade</span>
                </button>
              </div>
              {activities.length === 0 ? (
                <p className="aula-empty-text">Nenhuma atividade cadastrada.</p>
              ) : (
                <ul className="aula-activities-list">
                  {activities.map((a) => (
                    <li key={a.id} className="aula-activity-item">
                      <div className="aula-activity-info">
                        <strong>{a.title}</strong>
                        {a.description && <span className="aula-activity-desc">{a.description}</span>}
                        {a.filePath && (
                          <a
                            href={getFileUrl(a.filePath) ?? '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="aula-activity-file"
                          >
                            Baixar documento
                          </a>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteActivity(a.id)}
                        className="app-icon-btn app-icon-btn--delete"
                        title="Excluir atividade"
                        aria-label="Excluir atividade"
                      >
                        <FiTrash2 size={18} strokeWidth={2.25} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="aula-section">
            <h3>Alunos</h3>
            <div className="aula-students-card">
              <ul className="aula-students-list">
                {(aula.students ?? []).map((s) => {
                  const currentStatus = attendance[s.id] ?? (s.present === true ? 'P' : s.present === false ? 'F' : 'P')
                  const statusLabel = currentStatus === 'P' ? 'PRESENTE' : 'FALTOU'
                  const isUpdating = isSubmittingFreq === s.id
                  return (
                    <li key={s.id} className="aula-student-item">
                      {canEdit && (
                        <label className="aula-attendance-toggle" title={statusLabel}>
                          <input
                            type="checkbox"
                            checked={currentStatus === 'P'}
                            onChange={() => handleToggleAttendance(s.id, currentStatus === 'P' ? 'F' : 'P')}
                            disabled={isUpdating}
                          />
                          <span className="aula-toggle-slider" />
                        </label>
                      )}
                      <span className={`aula-student-status aula-student-status--${currentStatus === 'P' ? 'presente' : 'faltou'}`}>
                        {statusLabel}
                      </span>
                      <span className="aula-student-name">{s.name}</span>
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => navigate(`/users/${s.id}`)}
                          className="app-icon-btn app-icon-btn--info"
                          aria-label={`Ver detalhes de ${s.name}`}
                          title="Ver detalhes"
                        >
                          <FiInfo size={18} strokeWidth={2.25} aria-hidden />
                        </button>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {deleteConfirm && (
        <div className="confirm-modal-overlay" onClick={() => !isDeleting && setDeleteConfirm(false)}>
          <div className="confirm-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-modal-header">
              <h3>Excluir aula</h3>
              <button onClick={() => setDeleteConfirm(false)} disabled={isDeleting} className="confirm-modal-close" aria-label="Fechar">
                <IoClose size={22} />
              </button>
            </div>
            <div className="confirm-modal-body">
              <p>Tem certeza que deseja excluir esta aula? Esta ação não pode ser desfeita.</p>
            </div>
            <div className="confirm-modal-actions">
              <button onClick={() => setDeleteConfirm(false)} className="btn-secondary" disabled={isDeleting}>
                Cancelar
              </button>
              <button onClick={handleDelete} className="btn-danger" disabled={isDeleting}>
                {isDeleting ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showActivityModal && (
        <div className="modal-overlay" onClick={() => !isSubmittingActivity && setShowActivityModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Nova Atividade Avaliativa</h2>
              <button onClick={() => setShowActivityModal(false)} disabled={isSubmittingActivity} className="modal-close" aria-label="Fechar">
                <IoClose size={22} />
              </button>
            </div>
            <form onSubmit={handleSubmitActivity} className="modal-form">
              {activityError && <div className="alert-error">{activityError}</div>}
              <div className="form-group">
                <label htmlFor="activityTitle" className="form-label">Título *</label>
                <input
                  id="activityTitle"
                  type="text"
                  value={activityTitle}
                  onChange={(e) => setActivityTitle(e.target.value)}
                  className="form-input"
                  required
                  maxLength={255}
                  disabled={isSubmittingActivity}
                />
              </div>
              <div className="form-group">
                <label htmlFor="activityDesc" className="form-label">Descrição</label>
                <textarea
                  id="activityDesc"
                  value={activityDesc}
                  onChange={(e) => setActivityDesc(e.target.value)}
                  className="form-input form-textarea"
                  rows={3}
                  disabled={isSubmittingActivity}
                />
              </div>
              <div className="form-group">
                <label htmlFor="activityFile" className="form-label">Documento (PDF, TXT, DOCX)</label>
                <input
                  id="activityFile"
                  type="file"
                  accept=".pdf,.txt,.docx,.doc"
                  onChange={(e) => setActivityFile(e.target.files?.[0] ?? null)}
                  disabled={isSubmittingActivity}
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowActivityModal(false)} className="btn-secondary" disabled={isSubmittingActivity}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={isSubmittingActivity}>
                  {isSubmittingActivity ? 'Criando...' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
