import { useState, useEffect, useCallback, useRef } from 'react'
import { CharCounter } from '../CharCounter/CharCounter'
import { Modal } from '../ui/Modal'
import { Alert, Input, Textarea } from '../ui/FormField'
import { Button } from '../ui/Button'
import { FiUploadCloud, FiX, FiImage } from 'react-icons/fi'
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

export function AnnouncementEditorModal({ open, onClose, onSuccess, editingAnnouncement }: Props) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [imagePath, setImagePath] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [hiddenForRoles, setHiddenForRoles] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const resetForm = useCallback(() => {
    setTitle('')
    setContent('')
    setImagePath('')
    setImageFile(null)
    setHiddenForRoles([])
    setSubmitError(null)
    setSubmitSuccess(null)
    setImagePreview(null)
  }, [])

  const applyFile = useCallback((file: File) => {
    setImageFile(file)
    setImagePath('')
    const reader = new FileReader()
    reader.onload = (e) => setImagePreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }, [])

  const clearFile = useCallback(() => {
    setImageFile(null)
    setImagePreview(null)
    setImagePath('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [])

  useEffect(() => {
    if (!open) return
    setSubmitError(null)
    setSubmitSuccess(null)
    if (editingAnnouncement) {
      setTitle(editingAnnouncement.title)
      setContent(editingAnnouncement.content || '')
      setImagePath(editingAnnouncement.imagePath || '')
      setImageFile(null)
      setImagePreview(null)
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
      if (imageFile) {
        const { path } = await uploadFile(imageFile, 'announcements')
        finalImagePath = path
      }
      const announcementType: 'TEXT' | 'IMAGE' = finalImagePath ? 'IMAGE' : 'TEXT'
      if (editingAnnouncement) {
        const data: UpdateAnnouncementRequest = {
          title: title.trim(),
          content: content.trim() || undefined,
          type: announcementType,
          imagePath: finalImagePath,
          hiddenForRoles: hiddenForRoles.length > 0 ? hiddenForRoles : undefined,
        }
        await updateAnnouncement(editingAnnouncement.id, data)
        setSubmitSuccess('Aviso atualizado com sucesso!')
      } else {
        const data: CreateAnnouncementRequest = {
          title: title.trim(),
          content: content.trim() || undefined,
          type: announcementType,
          imagePath: finalImagePath,
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

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={editingAnnouncement ? 'Editar Aviso' : 'Novo Aviso'}
      footer={
        <>
          <Button variant="secondary" type="button" onClick={handleClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            type="submit"
            form="announcement-editor-form"
            loading={isSubmitting}
          >
            {editingAnnouncement ? 'Salvar' : 'Criar'}
          </Button>
        </>
      }
    >
      <form id="announcement-editor-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        {submitError && <Alert type="error">{submitError}</Alert>}
        {submitSuccess && <Alert type="success">{submitSuccess}</Alert>}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="announcementEditorTitle" className="text-sm font-medium text-[var(--color-text-primary)]">
            Título <span className="text-[var(--color-error)]">*</span>
          </label>
          <Input
            id="announcementEditorTitle"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título do aviso"
            required
            maxLength={255}
            disabled={isSubmitting}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="announcementEditorContent" className="text-sm font-medium text-[var(--color-text-primary)]">
            Conteúdo
          </label>
          <Textarea
            id="announcementEditorContent"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Texto do aviso"
            rows={4}
            disabled={isSubmitting}
            maxLength={ANNOUNCEMENT_CONTENT_MAX_CHARS}
            style={{ resize: 'none' }}
          />
          <div className="flex justify-end">
            <CharCounter current={content.length} max={ANNOUNCEMENT_CONTENT_MAX_CHARS} size={22} />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-[var(--color-text-primary)]">Imagem</span>
          <p className="text-xs text-[var(--color-text-muted)]">Opcional. Se nenhuma imagem for enviada, o aviso será publicado apenas com texto.</p>

          <input
            ref={fileInputRef}
            id="announcementEditorImageFile"
            type="file"
            accept="image/*"
            className="hidden"
            disabled={isSubmitting}
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) applyFile(f)
            }}
          />

          {imagePreview ? (
            <div className="relative overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
              <img src={imagePreview} alt="Preview" className="max-h-48 w-full object-cover" />
              {!isSubmitting && (
                <button
                  type="button"
                  onClick={clearFile}
                  aria-label="Remover imagem"
                  className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full border-none bg-black/60 text-white transition-colors cursor-pointer hover:bg-black/80"
                >
                  <FiX size={14} />
                </button>
              )}
              <div className="flex items-center gap-2 border-t border-[var(--color-border)] px-3 py-2">
                <FiImage size={13} className="shrink-0 text-[var(--color-text-muted)]" />
                <span className="truncate text-xs text-[var(--color-text-muted)]">{imageFile?.name}</span>
                {!isSubmitting && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="ml-auto shrink-0 cursor-pointer border-none bg-transparent text-xs text-[var(--color-primary)] hover:underline"
                  >
                    Trocar
                  </button>
                )}
              </div>
            </div>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); if (!isSubmitting) setIsDragOver(true) }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => {
                e.preventDefault()
                setIsDragOver(false)
                if (isSubmitting) return
                const f = e.dataTransfer.files?.[0]
                if (f && f.type.startsWith('image/')) applyFile(f)
              }}
              className={[
                'w-full cursor-pointer rounded-xl border-2 border-dashed bg-transparent px-6 py-8 transition-colors',
                'flex flex-col items-center justify-center gap-3',
                isDragOver
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                  : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-surface)]',
                isSubmitting ? 'cursor-not-allowed opacity-50' : '',
              ].join(' ')}
            >
              <div className={[
                'flex h-12 w-12 items-center justify-center rounded-full transition-colors',
                isDragOver ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]' : 'bg-[var(--color-surface)] text-[var(--color-text-muted)]',
              ].join(' ')}>
                <FiUploadCloud size={22} />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-[var(--color-text-primary)]">
                  {isDragOver ? 'Solte a imagem aqui' : 'Arraste uma imagem ou clique para selecionar'}
                </p>
                <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">PNG, JPG, WEBP</p>
              </div>
            </button>
          )}

          {editingAnnouncement && imagePath && !imageFile && !imagePreview && (
            <div className="flex items-center justify-between rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2">
              <p className="text-xs text-[var(--color-text-muted)]">Imagem atual mantida. Selecione acima para substituir ou remova para salvar sem imagem.</p>
              {!isSubmitting && (
                <button
                  type="button"
                  onClick={clearFile}
                  className="ml-3 shrink-0 cursor-pointer border-none bg-transparent text-xs text-[var(--color-error)] hover:underline"
                >
                  Remover
                </button>
              )}
            </div>
          )}
        </div>

        {/* Hidden for roles */}
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-[var(--color-text-primary)]">Ocultar para (exceção)</span>
          <p className="text-xs text-[var(--color-text-muted)]">
            Por padrão, o aviso é visível a todos. Marque os perfis que NÃO verão este aviso.
          </p>
          <div className="flex flex-wrap gap-3 mt-1">
            {ROLES.map((r) => (
              <label key={r.value} className="flex items-center gap-2 text-sm text-[var(--color-text-primary)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={hiddenForRoles.includes(r.value)}
                  onChange={() => toggleHiddenRole(r.value)}
                  disabled={isSubmitting}
                  className="accent-[var(--color-primary)] w-4 h-4"
                />
                {r.label}
              </label>
            ))}
          </div>
        </div>
      </form>
    </Modal>
  )
}
