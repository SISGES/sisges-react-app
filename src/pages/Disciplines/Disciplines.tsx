import { useState, useEffect, useCallback } from 'react'
import { IoClose } from 'react-icons/io5'
import { FiEdit2, FiPlus } from 'react-icons/fi'
import { BackButton } from '../../components/BackButton/BackButton'
import { getDisciplines, createDiscipline, updateDiscipline, searchTeachers } from '../../services/userService'
import { ApiError } from '../../services/api'
import type { DisciplineResponse, TeacherSearchResponse } from '../../types/auth'
import './Disciplines.css'

export function Disciplines() {
  const [disciplines, setDisciplines] = useState<DisciplineResponse[]>([])
  const [teachers, setTeachers] = useState<TeacherSearchResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingDiscipline, setEditingDiscipline] = useState<DisciplineResponse | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedTeacherIds, setSelectedTeacherIds] = useState<number[]>([])

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

  const fetchTeachers = useCallback(async () => {
    try {
      const data = await searchTeachers()
      setTeachers(data)
    } catch {
      void 0
    }
  }, [])

  useEffect(() => {
    fetchDisciplines()
    fetchTeachers()
  }, [fetchDisciplines, fetchTeachers])

  const resetForm = () => {
    setName('')
    setDescription('')
    setSelectedTeacherIds([])
    setEditingDiscipline(null)
    setSubmitError(null)
    setSubmitSuccess(null)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    resetForm()
  }

  const handleEdit = (d: DisciplineResponse) => {
    setEditingDiscipline(d)
    setName(d.name)
    setDescription(d.description || '')
    setSelectedTeacherIds(d.teachers?.map((t) => t.id) ?? [])
    setShowModal(true)
  }

  const toggleTeacher = (teacherId: number) => {
    setSelectedTeacherIds((prev) =>
      prev.includes(teacherId) ? prev.filter((id) => id !== teacherId) : [...prev, teacherId]
    )
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitError(null)
    setSubmitSuccess(null)
    setIsSubmitting(true)
    try {
      if (editingDiscipline) {
        await updateDiscipline(editingDiscipline.id, {
          name: name.trim(),
          description: description.trim() || undefined,
          teachers: teachers.map((t) => ({
            teacherId: t.id,
            vinculado: selectedTeacherIds.includes(t.id),
          })),
        })
        setSubmitSuccess('Disciplina atualizada com sucesso!')
      } else {
        await createDiscipline({
          name: name.trim(),
          description: description.trim() || undefined,
          teacherIds: selectedTeacherIds.length > 0 ? selectedTeacherIds : undefined,
        })
        setSubmitSuccess('Disciplina criada com sucesso!')
      }
      resetForm()
      fetchDisciplines()
      setTimeout(handleCloseModal, 1200)
    } catch (err) {
      if (err instanceof ApiError) {
        setSubmitError(err.message)
      } else if (err instanceof Error) {
        setSubmitError(err.message)
      } else {
        setSubmitError(editingDiscipline ? 'Erro ao atualizar disciplina.' : 'Erro ao criar disciplina.')
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
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="app-icon-btn app-icon-btn--add app-icon-btn--text"
                title="Nova disciplina"
                aria-label="Nova disciplina"
              >
                <FiPlus size={18} strokeWidth={2.25} />
                <span>Nova disciplina</span>
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
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="app-icon-btn app-icon-btn--add app-icon-btn--text"
                title="Criar primeira disciplina"
                aria-label="Criar primeira disciplina"
              >
                <FiPlus size={18} strokeWidth={2.25} />
                <span>Criar primeira disciplina</span>
              </button>
            </div>
          ) : (
            <div className="discipline-table-wrapper">
              <table className="discipline-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Descrição</th>
                    <th>Professores</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {disciplines.map((d) => (
                    <tr key={d.id}>
                      <td>{d.name}</td>
                      <td className="discipline-desc">{d.description || '-'}</td>
                      <td>{d.teachers?.map((t) => t.name).join(', ') || '-'}</td>
                      <td className="discipline-actions-cell">
                        <button
                          type="button"
                          onClick={() => handleEdit(d)}
                          className="app-icon-btn app-icon-btn--edit"
                          title="Editar disciplina"
                          aria-label={`Editar disciplina ${d.name}`}
                        >
                          <FiEdit2 size={18} strokeWidth={2.25} />
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

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingDiscipline ? 'Editar Disciplina' : 'Nova Disciplina'}</h2>
              <button onClick={handleCloseModal} className="modal-close" aria-label="Fechar">
                <IoClose size={22} />
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
              <div className="form-group">
                <label className="form-label">Professores vinculados</label>
                <div className="discipline-teachers-select">
                  {teachers.map((t) => (
                    <label key={t.id} className="discipline-teacher-option">
                      <input
                        type="checkbox"
                        checked={selectedTeacherIds.includes(t.id)}
                        onChange={() => toggleTeacher(t.id)}
                        disabled={isSubmitting}
                      />
                      <span>{t.name}</span>
                    </label>
                  ))}
                  {teachers.length === 0 && (
                    <span className="text-muted-small">Nenhum professor cadastrado.</span>
                  )}
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={handleCloseModal} className="btn-secondary" disabled={isSubmitting}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? (editingDiscipline ? 'Salvando...' : 'Criando...') : editingDiscipline ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
