import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'
type Size = 'sm' | 'md'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  children: ReactNode
  loading?: boolean
  icon?: ReactNode
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-[var(--color-primary)] text-white border border-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] hover:border-[var(--color-primary-hover)] disabled:opacity-50',
  secondary:
    'bg-transparent text-[var(--color-text-primary)] border border-[var(--color-border)] hover:border-[var(--color-text-muted)] disabled:opacity-50',
  danger:
    'bg-[var(--color-error)] text-white border border-[var(--color-error)] hover:opacity-90 disabled:opacity-50',
  ghost:
    'bg-transparent text-[var(--color-text-secondary)] border border-transparent hover:bg-[var(--color-surface)] hover:text-[var(--color-text-primary)] disabled:opacity-50',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  loading = false,
  icon,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={[
        'inline-flex items-center justify-center font-medium rounded-md cursor-pointer transition-all duration-150 select-none whitespace-nowrap',
        variantClasses[variant],
        sizeClasses[size],
        'disabled:cursor-not-allowed',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {loading ? (
        <span
          className="inline-block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"
          style={{ animation: 'spin 0.8s linear infinite' }}
        />
      ) : icon ? (
        <span className="flex-shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  )
}
