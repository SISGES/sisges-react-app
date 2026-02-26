import type { ReactNode } from 'react'
import { FiCheck, FiAlertTriangle, FiInfo } from 'react-icons/fi'
import { IoClose } from 'react-icons/io5'
import { useToast, Toast as ToastType } from '../../contexts/ToastContext'
import './Toast.css'

const TOAST_ICONS: Record<ToastType['type'], ReactNode> = {
  success: <FiCheck />,
  error: <IoClose />,
  warning: <FiAlertTriangle />,
  info: <FiInfo />,
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
            <IoClose size={18} />
          </button>
        </div>
      ))}
    </div>
  )
}
