import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchClasses, createClass } from '../../services/userService'
import { ApiError } from '../../services/api'
import type { ClassSearchResponse, CreateClassRequest } from '../../types/auth'
import './Classes.css'

export function Classes() {
  const navigate = useNavigate()
  const [classes, setClasses] = useState<ClassSearchResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)

  // Form state
  const [className, setClassName] = useState('')
  const [classYear, setClassYear] = useState(new Date().getFullYear())

  const fetchClasses = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await searchClasses()
      setClasses(data)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Erro ao carregar turmas.')
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchClasses()
  }, [fetchClasses])

  const resetForm = () => {
    setClassName('')
    setClassYear(new Date().getFullYear())
    setSubmitError(null)
    setSubmitSuccess(null)
  }

  const handleOpenModal = () => {
    resetForm()
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    resetForm()
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitError(null)
    setSubmitSuccess(null)
    setIsSubmitting(true)

    try {
      const requestData: CreateClassRequest = {
        name: className,
        year: classYear,
        studentIds: [],
        teacherIds: [],
        disciplineIds: [],
      }

      const response = await createClass(requestData)
      setSubmitSuccess(`Turma "${response.name}" criada com sucesso!`)
      resetForm()
      fetchClasses()
      // Close modal after success
      setTimeout(() => {
        handleCloseModal()
      }, 1500)
    } catch (err) {
      if (err instanceof ApiError) {
        setSubmitError(err.message)
      } else if (err instanceof Error) {
        setSubmitError(err.message)
      } else {
        setSubmitError('Erro ao criar turma.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="classes-container">
      <header className="classes-header">
        <div className="classes-header-content">
          <button onClick={() => navigate('/')} className="btn-back">
            &#8592; Voltar
          </button>
          <h1>Gestão de Turmas</h1>
        </div>
      </header>

      <div className="classes-content">
        <div className="classes-card">
          <div className="classes-card-header">
            <div className="classes-card-header-left">
              <h3 className="classes-card-title">Turmas Cadastradas</h3>
              {!isLoading && !error && (
                <span className="class-count">{classes.length} turma{classes.length !== 1 ? 's' : ''}</span>
              )}
            </div>
            <button onClick={handleOpenModal} className="btn-add-class">
              + Nova Turma
            </button>
          </div>

          {isLoading ? (
            <div className="classes-loading">
              <div className="loading-spinner-sm"></div>
              <span>Carregando turmas...</span>
            </div>
          ) : error ? (
            <div className="classes-error">
              <p>{error}</p>
              <button onClick={fetchClasses} className="btn-retry">
                Tentar novamente
              </button>
            </div>
          ) : classes.length === 0 ? (
            <div className="classes-empty">
              <p>Nenhuma turma cadastrada.</p>
            </div>
          ) : (
            <div className="class-table-wrapper">
              <table className="class-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Ano</th>
                    <th>Alunos</th>
                    <th>Professores</th>
                  </tr>
                </thead>
                <tbody>
                  {classes.map((c) => (
                    <tr key={c.id}>
                      <td>{c.name}</td>
                      <td>{c.year}</td>
                      <td>{c.studentCount}</td>
                      <td>{c.teacherCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal for creating new class */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Nova Turma</h2>
              <button onClick={handleCloseModal} className="modal-close">
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              {submitError && (
                <div className="alert-error" role="alert">
                  {submitError}
                </div>
              )}

              {submitSuccess && (
                <div className="alert-success" role="status">
                  {submitSuccess}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="className" className="form-label">
                  Nome da Turma
                </label>
                <input
                  id="className"
                  type="text"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="form-input"
                  placeholder="Ex: 1º Ano A"
                  required
                  maxLength={100}
                  disabled={isSubmitting}
                />
              </div>

              <div className="form-group">
                <label htmlFor="classYear" className="form-label">
                  Ano
                </label>
                <input
                  id="classYear"
                  type="number"
                  value={classYear}
                  onChange={(e) => setClassYear(parseInt(e.target.value, 10))}
                  className="form-input"
                  required
                  min={2000}
                  max={2100}
                  disabled={isSubmitting}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn-secondary"
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Criando...' : 'Criar Turma'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
