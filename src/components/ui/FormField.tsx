import type { InputHTMLAttributes, SelectHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'

interface FormFieldProps {
  label: string
  required?: boolean
  error?: string
  children: ReactNode
  hint?: string
}

export function FormField({ label, required, error, children, hint }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-[var(--color-text-primary)]">
        {label}
        {required && <span className="text-[var(--color-error)] ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-[var(--color-text-muted)]">{hint}</p>}
      {error && <p className="text-xs text-[var(--color-error)]">{error}</p>}
    </div>
  )
}

const inputBase =
  'w-full px-3 py-2 text-sm bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'

export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${inputBase} ${className}`} {...props} />
}

export function Select({ className = '', children, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  return (
    <select className={`${inputBase} ${className}`} {...props}>
      {children}
    </select>
  )
}

export function Textarea({ className = '', ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`${inputBase} resize-y min-h-[80px] ${className}`}
      {...props}
    />
  )
}

interface AlertProps {
  type: 'error' | 'success' | 'warning'
  children: ReactNode
}

const alertStyles: Record<AlertProps['type'], string> = {
  error: 'bg-[var(--color-error)]/10 border border-[var(--color-error)]/30 text-[var(--color-error)]',
  success: 'bg-[var(--color-success)]/10 border border-[var(--color-success)]/30 text-[var(--color-success)]',
  warning: 'bg-[var(--color-warning)]/10 border border-[var(--color-warning)]/30 text-[var(--color-warning)]',
}

export function Alert({ type, children }: AlertProps) {
  return (
    <div className={`px-4 py-3 rounded-md text-sm font-medium ${alertStyles[type]}`} role="alert">
      {children}
    </div>
  )
}

export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = { sm: 'w-4 h-4 border-2', md: 'w-6 h-6 border-2', lg: 'w-8 h-8 border-[3px]' }[size]
  return (
    <span
      className={`inline-block ${sizeClass} border-[var(--color-border)] border-t-[var(--color-primary)] rounded-full`}
      style={{ animation: 'spin 0.8s linear infinite' }}
    />
  )
}
