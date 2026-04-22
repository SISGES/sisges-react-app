import { useEffect, type ReactNode } from 'react'
import { IoClose } from 'react-icons/io5'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  maxWidth?: string
  footer?: ReactNode
}

export function Modal({ open, onClose, title, children, maxWidth = 'max-w-lg', footer }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Fechar"
        className="absolute inset-0 bg-black/50 cursor-default border-none p-0"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={[
          'relative z-10 w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-xl flex flex-col',
          maxWidth,
        ].join(' ')}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
          <h2 id="modal-title" className="text-base font-semibold text-[var(--color-text-primary)]">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex items-center justify-center w-8 h-8 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-background)] transition-colors border-none bg-transparent cursor-pointer"
          >
            <IoClose size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-4">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--color-border)]">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

interface ConfirmModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: ReactNode
  confirmLabel?: string
  confirmVariant?: 'danger' | 'primary'
  loading?: boolean
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirmar',
  loading = false,
}: ConfirmModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      maxWidth="max-w-md"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium rounded-md border border-[var(--color-border)] bg-transparent text-[var(--color-text-primary)] hover:border-[var(--color-text-muted)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium rounded-md bg-[var(--color-error)] text-white border border-[var(--color-error)] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer inline-flex items-center gap-2"
          >
            {loading && (
              <span
                className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full"
                style={{ animation: 'spin 0.8s linear infinite' }}
              />
            )}
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-[var(--color-text-primary)] text-sm leading-relaxed">{message}</p>
    </Modal>
  )
}
