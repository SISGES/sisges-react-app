import { useState, useEffect, useCallback } from 'react'
import { BackButton } from '../../components/BackButton/BackButton'
import { getDisciplines, createDiscipline } from '../../services/userService'
import { ApiError } from '../../services/api'
import type { DisciplineResponse } from '../../types/auth'
import './Disciplines.css'

export function Disciplines() {
  const [disciplines, setDisciplines] = useState<DisciplineResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const fetchDisciplines = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getDisciplines()
      setDisciplines(data)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Erro ao carregar disciplinas.')
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDisciplines()
  }, [fetchDisciplines])

  const resetForm = () => {
    setName('')
    setDescription('')
    setSubmitError(null)
    setSubmitSuccess(null)
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
      await createDiscipline({
        name: name.trim(),
        description: description.trim() || undefined,
      })
      setSubmitSuccess('Disciplina criada com sucesso!')
      resetForm()
      fetchDisciplines()
      setTimeout(handleCloseModal, 1200)
    } catch (err) {
      if (err instanceof ApiError) {
        setSubmitError(err.message)
      } else if (err instanceof Error) {
        setSubmitError(err.message)
      } else {
        setSubmitError('Erro ao criar disciplina.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="disciplines-container">
      <header className="disciplines-header">
        <div className="disciplines-header-content">
          <BackButton to="/" />
          <h1>Disciplinas</h1>
        </div>
      </header>

      <div className="disciplines-content">
        <div className="disciplines-card">
          <div className="disciplines-card-header">
            <h3 className="disciplines-card-title">Disciplinas Cadastradas</h3>
            {!isLoading && !error && (
              <button onClick={() => setShowModal(true)} className="btn-add-discipline">
                + Nova Disciplina
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="disciplines-loading">
              <div className="loading-spinner-sm"></div>
              <span>Carregando disciplinas...</span>
            </div>
          ) : error ? (
            <div className="disciplines-error">
              <p>{error}</p>
              <button onClick={fetchDisciplines} className="btn-retry">
                Tentar novamente
              </button>
            </div>
          ) : disciplines.length === 0 ? (
            <div className="disciplines-empty">
              <p>Nenhuma disciplina cadastrada.</p>
              <button onClick={() => setShowModal(true)} className="btn-add-discipline-inline">
                Criar primeira disciplina
              </button>
            </div>
          ) : (
            <div className="discipline-table-wrapper">
              <table className="discipline-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Descrição</th>
                  </tr>
                </thead>
                <tbody>
                  {disciplines.map((d) => (
                    <tr key={d.id}>
                      <td>{d.name}</td>
                      <td className="discipline-desc">{d.description || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Nova Disciplina</h2>
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
                <label htmlFor="disciplineName" className="form-label">
                  Nome *
                </label>
                <input
                  id="disciplineName"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                  placeholder="Ex: Matemática"
                  required
                  maxLength={150}
                  disabled={isSubmitting}
                />
              </div>
              <div className="form-group">
                <label htmlFor="disciplineDesc" className="form-label">
                  Descrição
                </label>
                <textarea
                  id="disciplineDesc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-input form-textarea"
                  placeholder="Descrição opcional"
                  maxLength={5000}
                  rows={3}
                  disabled={isSubmitting}
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={handleCloseModal} className="btn-secondary" disabled={isSubmitting}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Criando...' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
