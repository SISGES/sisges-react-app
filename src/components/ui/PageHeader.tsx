import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
  back?: ReactNode
}

export function PageHeader({ title, subtitle, action, back }: PageHeaderProps) {
  return (
    <div className="flex items-center gap-3 px-6 py-4 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
      {back}
      <div className="flex-1 min-w-0">
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)] truncate">{title}</h1>
        {subtitle && (
          <p className="text-sm text-[var(--color-text-muted)] mt-0.5">{subtitle}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}
