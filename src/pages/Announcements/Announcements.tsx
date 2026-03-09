import { useState, useEffect, useCallback } from 'react'
import { IoClose } from 'react-icons/io5'
import { BackButton } from '../../components/BackButton/BackButton'
import {
  getAllAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '../../services/announcementService'
import { uploadFile } from '../../services/uploadService'
import type {
  Announcement,
  CreateAnnouncementRequest,
  UpdateAnnouncementRequest,
} from '../../services/announcementService'
import { ApiError } from '../../services/api'
import './Announcements.css'

const ROLES = [
  { value: 'ADMIN', label: 'Administrador' },
  { value: 'TEACHER', label: 'Professor' },
  { value: 'STUDENT', label: 'Aluno' },
]

export function Announcements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Announcement | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [type, setType] = useState<'TEXT' | 'IMAGE'>('TEXT')
  const [imagePath, setImagePath] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [hiddenForRoles, setHiddenForRoles] = useState<string[]>([])

  const fetchAnnouncements = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getAllAnnouncements()
      setAnnouncements(data)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao carregar avisos.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAnnouncements()
  }, [fetchAnnouncements])

  const resetForm = () => {
    setTitle('')
    setContent('')
    setType('TEXT')
    setImagePath('')
    setImageFile(null)
    setHiddenForRoles([])
    setEditing(null)
    setSubmitError(null)
    setSubmitSuccess(null)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    resetForm()
  }

  const handleEdit = (a: Announcement) => {
    setEditing(a)
    setTitle(a.title)
    setContent(a.content || '')
    setType(a.type)
    setImagePath(a.imagePath || '')
    setImageFile(null)
    setHiddenForRoles(a.hiddenForRoles || [])
    setShowModal(true)
  }

  const toggleHiddenRole = (role: string) => {
    setHiddenForRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    )
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitError(null)
    setSubmitSuccess(null)
    setIsSubmitting(true)
    try {
      let finalImagePath = imagePath.trim() || undefined
      if (type === 'IMAGE' && imageFile) {
        const { path } = await uploadFile(imageFile, 'announcements')
        finalImagePath = path
      }
      if (editing) {
        const data: UpdateAnnouncementRequest = {
          title: title.trim(),
          content: content.trim() || undefined,
          type,
          imagePath: type === 'IMAGE' ? finalImagePath : undefined,
          hiddenForRoles: hiddenForRoles.length > 0 ? hiddenForRoles : undefined,
        }
        await updateAnnouncement(editing.id, data)
        setSubmitSuccess('Aviso atualizado com sucesso!')
      } else {
        const data: CreateAnnouncementRequest = {
          title: title.trim(),
          content: content.trim() || undefined,
          type,
          imagePath: type === 'IMAGE' ? finalImagePath : undefined,
          hiddenForRoles: hiddenForRoles.length > 0 ? hiddenForRoles : undefined,
        }
        await createAnnouncement(data)
        setSubmitSuccess('Aviso criado com sucesso!')
      }
      resetForm()
      fetchAnnouncements()
      setTimeout(handleCloseModal, 1200)
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : 'Erro ao salvar aviso.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Excluir este aviso?')) return
    try {
      await deleteAnnouncement(id)
      fetchAnnouncements()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao excluir.')
    }
  }

  return (
    <div className="announcements-container">
      <header className="announcements-header">
        <div className="announcements-header-content">
          <BackButton to="/" />
          <h1>Banners de Aviso</h1>
        </div>
      </header>

      <div className="announcements-content">
        <div className="announcements-card">
          <div className="announcements-card-header">
            <h3 className="announcements-card-title">Avisos Cadastrados</h3>
            {!isLoading && !error && (
              <button onClick={() => setShowModal(true)} className="btn-add-announcement">
                + Novo Aviso
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="announcements-loading">
              <div className="loading-spinner-sm"></div>
              <span>Carregando avisos...</span>
            </div>
          ) : error ? (
            <div className="announcements-error">
              <p>{error}</p>
              <button onClick={fetchAnnouncements} className="btn-retry">
                Tentar novamente
              </button>
            </div>
          ) : announcements.length === 0 ? (
            <div className="announcements-empty">
              <p>Nenhum aviso cadastrado.</p>
              <button onClick={() => setShowModal(true)} className="btn-add-announcement-inline">
                Criar primeiro aviso
              </button>
            </div>
          ) : (
            <div className="announcements-list">
              {announcements.map((a) => (
                <div key={a.id} className="announcement-row">
                  <div className="announcement-row-info">
                    <strong>{a.title}</strong>
                    <span className="announcement-row-meta">
                      {a.type} • {a.hiddenForRoles?.length ? `Oculto para: ${a.hiddenForRoles.join(', ')}` : 'Visível a todos'}
                    </span>
                  </div>
                  <div className="announcement-row-actions">
                    <button onClick={() => handleEdit(a)} className="btn-edit-announcement">
                      Editar
                    </button>
                    <button onClick={() => handleDelete(a.id)} className="btn-delete-announcement">
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content modal-announcement" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editing ? 'Editar Aviso' : 'Novo Aviso'}</h2>
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
                <label htmlFor="announcementTitle" className="form-label">
                  Título *
                </label>
                <input
                  id="announcementTitle"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="form-input"
                  placeholder="Título do aviso"
                  required
                  maxLength={255}
                  disabled={isSubmitting}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Tipo</label>
                <div className="announcement-type-select">
                  <label className="announcement-type-option">
                    <input
                      type="radio"
                      name="type"
                      value="TEXT"
                      checked={type === 'TEXT'}
                      onChange={() => setType('TEXT')}
                      disabled={isSubmitting}
                    />
                    <span>Texto</span>
                  </label>
                  <label className="announcement-type-option">
                    <input
                      type="radio"
                      name="type"
                      value="IMAGE"
                      checked={type === 'IMAGE'}
                      onChange={() => setType('IMAGE')}
                      disabled={isSubmitting}
                    />
                    <span>Imagem</span>
                  </label>
                </div>
              </div>
              {type === 'TEXT' && (
                <div className="form-group">
                  <label htmlFor="announcementContent" className="form-label">
                    Conteúdo
                  </label>
                  <textarea
                    id="announcementContent"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="form-input form-textarea announcement-textarea"
                    placeholder="Texto do aviso"
                    rows={4}
                    disabled={isSubmitting}
                    style={{ resize: 'none' }}
                  />
                </div>
              )}
              {type === 'IMAGE' && (
                <div className="form-group">
                  <label htmlFor="announcementImageFile" className="form-label">
                    Imagem (arquivo do computador)
                  </label>
                  <input
                    id="announcementImageFile"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      setImageFile(f ?? null)
                      if (f) setImagePath('')
                    }}
                    disabled={isSubmitting}
                  />
                  {editing && imagePath && !imageFile && (
                    <p className="form-hint">Imagem atual: {imagePath}</p>
                  )}
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Ocultar para (exceção)</label>
                <p className="form-hint">Por padrão, o aviso é visível a todos. Marque os perfis que NÃO verão este aviso.</p>
                <div className="announcement-roles-select">
                  {ROLES.map((r) => (
                    <label key={r.value} className="announcement-role-option">
                      <input
                        type="checkbox"
                        checked={hiddenForRoles.includes(r.value)}
                        onChange={() => toggleHiddenRole(r.value)}
                        disabled={isSubmitting}
                      />
                      <span>{r.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={handleCloseModal} className="btn-secondary" disabled={isSubmitting}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? (editing ? 'Salvando...' : 'Criando...') : editing ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
