import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  back?: ReactNode;
}

export function PageHeader({ title, subtitle, action, back }: PageHeaderProps) {
  return (
    <div className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="mx-auto flex w-full max-w-[1280px] items-center gap-3 px-5 py-5 sm:px-6 lg:px-8">
        {back}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl font-bold tracking-[-0.025em] text-[var(--color-text-primary)] sm:text-[1.75rem]">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              {subtitle}
            </p>
          )}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </div>
  );
}
