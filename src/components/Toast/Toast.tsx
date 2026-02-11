import { useToast, Toast as ToastType } from '../../contexts/ToastContext'
import './Toast.css'

const TOAST_ICONS: Record<ToastType['type'], string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
}

export function ToastContainer() {
  const { toasts, removeToast } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type}`}
          role="alert"
        >
          <span className="toast-icon">{TOAST_ICONS[toast.type]}</span>
          <span className="toast-message">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="toast-close"
            aria-label="Fechar"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
