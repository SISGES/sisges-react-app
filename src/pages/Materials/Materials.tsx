import { useState, useEffect, useCallback } from 'react'
import { IoClose } from 'react-icons/io5'
import { FiPlus, FiTrash2 } from 'react-icons/fi'
import { BackButton } from '../../components/BackButton/BackButton'
import { getMaterials, createMaterial, deleteMaterial } from '../../services/materialService'
import { searchClasses, getDisciplines } from '../../services/userService'
import { uploadFile } from '../../services/uploadService'
import type { DisciplineMaterial, CreateDisciplineMaterialRequest } from '../../services/materialService'
import type { ClassSearchResponse, DisciplineResponse } from '../../types/auth'
import { ApiError } from '../../services/api'
import './Materials.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'
const UPLOAD_BASE = API_BASE.replace('/api', '')

export function Materials() {
  const [materials, setMaterials] = useState<DisciplineMaterial[]>([])
  const [classes, setClasses] = useState<ClassSearchResponse[]>([])
  const [disciplines, setDisciplines] = useState<DisciplineResponse[]>([])
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null)
  const [selectedDisciplineId, setSelectedDisciplineId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [materialFile, setMaterialFile] = useState<File | null>(null)
  const [modalDisciplineId, setModalDisciplineId] = useState<number | null>(null)

  const fetchMaterials = useCallback(async () => {
    if (!selectedClassId) {
      setMaterials([])
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const data = await getMaterials({
        classId: selectedClassId,
        disciplineId: selectedDisciplineId ?? undefined,
      })
      setMaterials(data)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao carregar materiais.')
    } finally {
      setIsLoading(false)
    }
  }, [selectedClassId, selectedDisciplineId])

  useEffect(() => {
    fetchMaterials()
  }, [fetchMaterials])

  useEffect(() => {
    async function load() {
      try {
        const [c, d] = await Promise.all([searchClasses(), getDisciplines()])
        setClasses(c)
        setDisciplines(d)
      } catch {
        void 0
      }
    }
    load()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedClassId || !title.trim()) return
    const discId = modalDisciplineId ?? selectedDisciplineId ?? disciplines[0]?.id
    if (!discId) {
      setSubmitError('Selecione uma disciplina.')
      return
    }
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      let filePath: string | undefined
      if (materialFile) {
        const { path } = await uploadFile(materialFile, 'materials')
        filePath = path
      }
      const data: CreateDisciplineMaterialRequest = {
        classId: selectedClassId,
        disciplineId: discId as number,
        title: title.trim(),
        description: description.trim() || undefined,
        filePath,
      }
      await createMaterial(data)
      setTitle('')
      setDescription('')
      setMaterialFile(null)
      setModalDisciplineId(null)
      setShowModal(false)
      fetchMaterials()
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : 'Erro ao criar material.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Excluir este material?')) return
    try {
      await deleteMaterial(id)
      fetchMaterials()
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Erro ao excluir.')
    }
  }

  const getFileUrl = (path: string | null) =>
    path ? (path.startsWith('http') ? path : `${UPLOAD_BASE}${path}`) : null

  return (
    <div className="materials-container">
      <header className="materials-header">
        <div className="materials-header-content">
          <BackButton to="/" />
          <h1>Materiais de Estudo</h1>
        </div>
      </header>

      <div className="materials-content">
        <div className="materials-filters">
          <div className="filter-group">
            <label>Turma</label>
            <select
              value={selectedClassId ?? ''}
              onChange={(e) => setSelectedClassId(e.target.value ? Number(e.target.value) : null)}
              className="filter-select"
            >
              <option value="">Selecione a turma</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} - {c.academicYear}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Disciplina</label>
            <select
              value={selectedDisciplineId ?? ''}
              onChange={(e) => setSelectedDisciplineId(e.target.value ? Number(e.target.value) : null)}
              className="filter-select"
            >
              <option value="">Todas</option>
              {disciplines.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          {selectedClassId && (
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="app-icon-btn app-icon-btn--add app-icon-btn--text"
              title="Novo material"
              aria-label="Novo material"
            >
              <FiPlus size={18} strokeWidth={2.25} />
              <span>Novo material</span>
            </button>
          )}
        </div>

        {!selectedClassId ? (
          <div className="materials-empty">
            <p>Selecione uma turma para ver os materiais.</p>
          </div>
        ) : isLoading ? (
          <div className="materials-loading">
            <div className="loading-spinner-sm"></div>
            <span>Carregando materiais...</span>
          </div>
        ) : error ? (
          <div className="materials-error">
            <p>{error}</p>
            <button onClick={fetchMaterials} className="btn-retry">
              Tentar novamente
            </button>
          </div>
        ) : materials.length === 0 ? (
          <div className="materials-empty">
            <p>Nenhum material cadastrado para esta turma.</p>
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="app-icon-btn app-icon-btn--add app-icon-btn--text"
              title="Criar primeiro material"
              aria-label="Criar primeiro material"
            >
              <FiPlus size={18} strokeWidth={2.25} />
              <span>Criar primeiro material</span>
            </button>
          </div>
        ) : (
          <div className="materials-list">
            {materials.map((m) => (
              <div key={m.id} className="material-card">
                <div className="material-card-info">
                  <strong>{m.title}</strong>
                  <span className="material-card-meta">{m.disciplineName}</span>
                  {m.description && (
                    <p className="material-card-desc">{m.description}</p>
                  )}
                  {m.filePath && (
                    <a
                      href={getFileUrl(m.filePath) ?? '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="material-card-file"
                    >
                      Baixar documento
                    </a>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(m.id)}
                  className="app-icon-btn app-icon-btn--delete"
                  title="Excluir material"
                  aria-label={`Excluir material ${m.title}`}
                >
                  <FiTrash2 size={18} strokeWidth={2.25} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => !isSubmitting && setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Novo Material</h2>
              <button onClick={() => setShowModal(false)} disabled={isSubmitting} className="modal-close" aria-label="Fechar">
                <IoClose size={22} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              {submitError && <div className="alert-error">{submitError}</div>}
              <div className="form-group">
                <label className="form-label">Disciplina *</label>
                <select
                  value={modalDisciplineId ?? selectedDisciplineId ?? ''}
                  onChange={(e) => setModalDisciplineId(e.target.value ? Number(e.target.value) : null)}
                  className="form-input"
                  required
                  disabled={isSubmitting}
                >
                  <option value="">Selecione</option>
                  {disciplines.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Título *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="form-input"
                  required
                  maxLength={255}
                  disabled={isSubmitting}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Descrição</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-input form-textarea"
                  rows={3}
                  disabled={isSubmitting}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Arquivo (PDF, TXT, DOCX)</label>
                <input
                  type="file"
                  accept=".pdf,.txt,.docx,.doc"
                  onChange={(e) => setMaterialFile(e.target.files?.[0] ?? null)}
                  disabled={isSubmitting}
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary" disabled={isSubmitting}>
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
