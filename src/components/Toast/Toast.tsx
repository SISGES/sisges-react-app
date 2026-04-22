import type { ReactNode } from 'react'
import { FiCheck, FiAlertTriangle, FiInfo } from 'react-icons/fi'
import { IoClose } from 'react-icons/io5'
import { useToast, Toast as ToastType } from '../../contexts/ToastContext'

const TOAST_ICONS: Record<ToastType['type'], ReactNode> = {
  success: <FiCheck size={16} />,
  error: <IoClose size={16} />,
  warning: <FiAlertTriangle size={16} />,
  info: <FiInfo size={16} />,
}

const TOAST_STYLES: Record<ToastType['type'], string> = {
  success: 'bg-[var(--color-success)] text-white',
  error: 'bg-[var(--color-error)] text-white',
  warning: 'bg-[var(--color-warning)] text-white',
  info: 'bg-[var(--color-primary)] text-white',
}

export function ToastContainer() {
  const { toasts, removeToast } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 max-w-xs w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="alert"
          className={[
            'flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm font-medium',
            TOAST_STYLES[toast.type],
          ].join(' ')}
        >
          <span className="flex-shrink-0">{TOAST_ICONS[toast.type]}</span>
          <span className="flex-1">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            aria-label="Fechar"
            className="flex-shrink-0 opacity-80 hover:opacity-100 transition-opacity bg-transparent border-none cursor-pointer text-inherit p-0 flex items-center"
          >
            <IoClose size={18} />
          </button>
        </div>
      ))}
    </div>
  )
}
