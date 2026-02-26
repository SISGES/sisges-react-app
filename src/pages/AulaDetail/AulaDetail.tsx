import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FiEye } from 'react-icons/fi'
import { IoClose } from 'react-icons/io5'
import { BackButton } from '../../components/BackButton/BackButton'
import {
  getAulaById,
  deleteAula,
  submitAulaFrequency,
} from '../../services/userService'
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
  const [attendance, setAttendance] = useState<Record<string, 'P' | 'F'>>({})
  const [savedAttendance, setSavedAttendance] = useState<Record<number, 'P' | 'F'>>({})
  const [showFrequencyModal, setShowFrequencyModal] = useState(false)
  const [isSubmittingFreq, setIsSubmittingFreq] = useState(false)
  const [freqError, setFreqError] = useState<string | null>(null)

  const isAdmin = user?.role === 'ADMIN'
  const canEdit = user?.role === 'TEACHER' || user?.role === 'ADMIN'

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
          const initial: Record<string, 'P' | 'F'> = {}
          const saved: Record<number, 'P' | 'F'> = {}
          ;(data.students ?? []).forEach((s) => {
            const status = s.present === true ? 'P' : s.present === false ? 'F' : 'P'
            initial[s.name] = status
            if (s.present !== undefined && s.present !== null) {
              saved[s.id] = status
            }
          })
          setAttendance(initial)
          setSavedAttendance(saved)
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
  }, [aulaId])

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

  const handleSubmitFrequency = async () => {
    if (!aulaId || !aula) return
    setIsSubmittingFreq(true)
    setFreqError(null)
    try {
      const entries = (aula.students ?? []).map((s) => ({
        studentId: s.id,
        status: (attendance[s.name] ?? 'P') as 'P' | 'F',
      }))
      await submitAulaFrequency(aulaId, { entries })
      const newSaved: Record<number, 'P' | 'F'> = {}
      entries.forEach((e) => {
        newSaved[e.studentId] = e.status
      })
      setSavedAttendance(newSaved)
      setShowFrequencyModal(false)
    } catch (err) {
      if (err instanceof ApiError) {
        setFreqError(err.message)
      } else if (err instanceof Error) {
        setFreqError(err.message)
      } else {
        setFreqError('Erro ao lançar frequência.')
      }
    } finally {
      setIsSubmittingFreq(false)
    }
  }

  const setStudentAttendance = (studentName: string, status: 'P' | 'F') => {
    setAttendance((prev) => ({ ...prev, [studentName]: status }))
  }

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
          <div className="aula-detail-actions">
            {canEdit && (
              <button onClick={() => navigate(`/aulas/${aulaId}/edit`)} className="btn-edit-aula">
                Editar
              </button>
            )}
            {canEdit && (
              <button onClick={() => setShowFrequencyModal(true)} className="btn-frequency">
                Lançar Frequência
              </button>
            )}
            {isAdmin && (
              <button
                onClick={() => setDeleteConfirm(true)}
                className="btn-delete-aula"
                disabled={isDeleting}
              >
                Excluir
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
                  onClick={() => navigate(`/users/${aula.professor.id}`)}
                  className="btn-view-detail"
                  aria-label="Ver detalhes do professor"
                  title="Ver detalhes"
                >
                  <FiEye className="icon-eye" size={20} aria-hidden />
                </button>
              )}
            </div>
          </div>

          <div className="aula-section">
            <h3>Alunos</h3>
            <div className="aula-students-card">
              <ul className="aula-students-list">
                {(aula.students ?? []).map((s) => {
                  const status = s.present !== undefined && s.present !== null
                    ? (s.present ? 'PRESENTE' : 'FALTOU')
                    : savedAttendance[s.id]
                      ? (savedAttendance[s.id] === 'P' ? 'PRESENTE' : 'FALTOU')
                      : 'Não lançada'
                  return (
                    <li key={s.id} className="aula-student-item">
                      <span className={`aula-student-status aula-student-status--${status === 'PRESENTE' ? 'presente' : status === 'FALTOU' ? 'faltou' : 'nao-lancada'}`}>
                        {status}
                      </span>
                      <span className="aula-student-name">{s.name}</span>
                      {isAdmin && (
                        <button
                          onClick={() => navigate(`/users/${s.id}`)}
                          className="btn-view-detail"
                          aria-label={`Ver detalhes de ${s.name}`}
                          title="Ver detalhes"
                        >
                          <FiEye className="icon-eye" size={20} aria-hidden />
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

      {showFrequencyModal && (
        <div className="modal-overlay" onClick={() => !isSubmittingFreq && setShowFrequencyModal(false)}>
          <div className="modal-content frequency-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Lançar Frequência</h2>
              <button onClick={() => setShowFrequencyModal(false)} disabled={isSubmittingFreq} className="modal-close" aria-label="Fechar">
                <IoClose size={22} />
              </button>
            </div>
            <div className="modal-body">
              {freqError && <div className="alert-error">{freqError}</div>}
              <div className="frequency-list">
                {(aula.students ?? []).map((s) => (
                  <div key={s.id} className="frequency-row">
                    <span>{s.name}</span>
                    <div className="frequency-options">
                      <label>
                        <input
                          type="radio"
                          name={`freq-${s.id}`}
                          checked={attendance[s.name] === 'P'}
                          onChange={() => setStudentAttendance(s.name, 'P')}
                        />
                        Presente
                      </label>
                      <label>
                        <input
                          type="radio"
                          name={`freq-${s.id}`}
                          checked={attendance[s.name] === 'F'}
                          onChange={() => setStudentAttendance(s.name, 'F')}
                        />
                        Faltoso
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowFrequencyModal(false)} className="btn-secondary" disabled={isSubmittingFreq}>
                Cancelar
              </button>
              <button onClick={handleSubmitFrequency} className="btn-primary" disabled={isSubmittingFreq}>
                {isSubmittingFreq ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
