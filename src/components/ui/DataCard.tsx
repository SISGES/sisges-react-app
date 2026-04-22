import type { ReactNode } from 'react'
import { Spinner } from './FormField'

const stateShellClass =
  'flex w-full min-h-[min(50vh,22rem)] flex-col items-center justify-center gap-3 py-12 text-center'

/** Consistent card with a section header and body */
export function DataCard({
  title,
  count,
  countLabel,
  action,
  children,
}: {
  title: string
  count?: number
  countLabel?: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="bg-[var(--color-surface)] border-b border-[var(--color-border)]">
      {/* Card header */}
      <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-[var(--color-border)] flex-wrap">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">{title}</h2>
          {count !== undefined && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-text-muted)]">
              {count} {countLabel ?? ''}
            </span>
          )}
        </div>
        {action}
      </div>
      {children}
    </div>
  )
}

/** Standard loading / error / empty state block */
export function StateBlock({
  loading,
  loadingText,
  error,
  onRetry,
  empty,
  emptyText,
  children,
}: {
  loading?: boolean
  loadingText?: string
  error?: string | null
  onRetry?: () => void
  empty?: boolean
  emptyText?: string
  children: ReactNode
}) {
  if (loading) {
    return (
      <div
        className={`${stateShellClass} text-[var(--color-text-muted)]`}
        aria-busy="true"
        aria-live="polite"
      >
        <Spinner size="md" />
        <span className="text-sm">{loadingText ?? 'Carregando...'}</span>
      </div>
    )
  }
  if (error) {
    return (
      <div className={`${stateShellClass} text-[var(--color-error)]`}>
        <p className="text-sm">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-sm px-3 py-1.5 border border-[var(--color-border)] rounded-md bg-transparent text-[var(--color-text-primary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] cursor-pointer transition-colors"
          >
            Tentar novamente
          </button>
        )}
      </div>
    )
  }
  if (empty) {
    return (
      <div className={stateShellClass}>
        <p className="text-sm text-[var(--color-text-muted)]">{emptyText ?? 'Nenhum resultado.'}</p>
      </div>
    )
  }
  return <div className="content-reveal w-full min-w-0">{children}</div>
}

/** Standard data table with consistent th/td styling */
export const tableStyles = {
  wrapper: 'overflow-x-auto',
  table: 'w-full text-sm border-collapse',
  th: 'px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)] border-b border-[var(--color-border)] bg-[var(--color-background)] whitespace-nowrap',
  td: 'px-6 py-3.5 text-[var(--color-text-primary)] border-b border-[var(--color-border)]',
  trHover: 'hover:bg-[var(--color-background)] transition-colors',
  actionsCell: 'px-6 py-3 text-right',
}
