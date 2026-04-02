import { useState, useEffect, useCallback } from 'react'
import { IoClose } from 'react-icons/io5'
import { CharCounter } from '../CharCounter/CharCounter'
import {
  createAnnouncement,
  updateAnnouncement,
} from '../../services/announcementService'
import type {
  Announcement,
  CreateAnnouncementRequest,
  UpdateAnnouncementRequest,
} from '../../services/announcementService'
import { ApiError } from '../../services/api'
import { uploadFile } from '../../services/uploadService'
import './AnnouncementEditorModal.css'

const ROLES = [
  { value: 'ADMIN', label: 'Administrador' },
  { value: 'TEACHER', label: 'Professor' },
  { value: 'STUDENT', label: 'Aluno' },
]

const ANNOUNCEMENT_CONTENT_MAX_CHARS = 320

type Props = {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  editingAnnouncement: Announcement | null
}

export function AnnouncementEditorModal({
  open,
  onClose,
  onSuccess,
  editingAnnouncement,
}: Props) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [type, setType] = useState<'TEXT' | 'IMAGE'>('TEXT')
  const [imagePath, setImagePath] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [hiddenForRoles, setHiddenForRoles] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)

  const resetForm = useCallback(() => {
    setTitle('')
    setContent('')
    setType('TEXT')
    setImagePath('')
    setImageFile(null)
    setHiddenForRoles([])
    setSubmitError(null)
    setSubmitSuccess(null)
  }, [])

  useEffect(() => {
    if (!open) return
    setSubmitError(null)
    setSubmitSuccess(null)
    if (editingAnnouncement) {
      setTitle(editingAnnouncement.title)
      setContent(editingAnnouncement.content || '')
      setType(editingAnnouncement.type)
      setImagePath(editingAnnouncement.imagePath || '')
      setImageFile(null)
      setHiddenForRoles(editingAnnouncement.hiddenForRoles || [])
    } else {
      resetForm()
    }
  }, [open, editingAnnouncement, resetForm])

  const handleClose = () => {
    resetForm()
    onClose()
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
      if (editingAnnouncement) {
        const data: UpdateAnnouncementRequest = {
          title: title.trim(),
          content: content.trim() || undefined,
          type,
          imagePath: type === 'IMAGE' ? finalImagePath : undefined,
          hiddenForRoles: hiddenForRoles.length > 0 ? hiddenForRoles : undefined,
        }
        await updateAnnouncement(editingAnnouncement.id, data)
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
      onSuccess()
      setTimeout(handleClose, 1200)
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : 'Erro ao salvar aviso.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div className="announcement-editor-modal-overlay" onClick={handleClose}>
      <div
        className="announcement-editor-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="announcement-editor-modal-header">
          <h2>{editingAnnouncement ? 'Editar Aviso' : 'Novo Aviso'}</h2>
          <button
            type="button"
            onClick={handleClose}
            className="modal-close"
            aria-label="Fechar"
          >
            <IoClose size={22} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="announcement-editor-modal-form">
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
            <label htmlFor="announcementEditorTitle" className="form-label">
              Título *
            </label>
            <input
              id="announcementEditorTitle"
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
                  name="announcementEditorType"
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
                  name="announcementEditorType"
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
              <label htmlFor="announcementEditorContent" className="form-label">
                Conteúdo
              </label>
              <textarea
                id="announcementEditorContent"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="form-input form-textarea"
                placeholder="Texto do aviso"
                rows={4}
                disabled={isSubmitting}
                maxLength={ANNOUNCEMENT_CONTENT_MAX_CHARS}
                style={{ resize: 'none' }}
              />
              <div className="announcement-editor-modal-counter-row">
                <CharCounter
                  current={content.length}
                  max={ANNOUNCEMENT_CONTENT_MAX_CHARS}
                  size={24}
                />
              </div>
            </div>
          )}
          {type === 'IMAGE' && (
            <div className="form-group">
              <label htmlFor="announcementEditorImageFile" className="form-label">
                Imagem (arquivo do computador)
              </label>
              <input
                id="announcementEditorImageFile"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  setImageFile(f ?? null)
                  if (f) setImagePath('')
                }}
                disabled={isSubmitting}
              />
              {editingAnnouncement && imagePath && !imageFile && (
                <p className="form-hint">Imagem atual: {imagePath}</p>
              )}
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Ocultar para (exceção)</label>
            <p className="form-hint">
              Por padrão, o aviso é visível a todos. Marque os perfis que NÃO verão
              este aviso.
            </p>
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
          <div className="announcement-editor-modal-actions">
            <button
              type="button"
              onClick={handleClose}
              className="btn-secondary"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting
                ? editingAnnouncement
                  ? 'Salvando...'
                  : 'Criando...'
                : editingAnnouncement
                  ? 'Salvar'
                  : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
