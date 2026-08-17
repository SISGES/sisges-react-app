import type { ReactNode } from "react";
import { Spinner } from "./FormField";

const stateShellClass =
  "flex w-full min-h-[min(50vh,22rem)] flex-col items-center justify-center gap-3 py-12 text-center";

/** Consistent card with a section header and body */
export function DataCard({
  title,
  count,
  countLabel,
  action,
  children,
}: {
  title: string;
  count?: number;
  countLabel?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="surface-panel mx-auto w-full max-w-[1280px] overflow-hidden">
      {/* Card header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-bold text-[var(--color-text-primary)]">
            {title}
          </h2>
          {count !== undefined && (
            <span className="rounded-full bg-[var(--color-surface-subtle)] px-2.5 py-1 text-xs font-medium text-[var(--color-text-secondary)]">
              {count} {countLabel ?? ""}
            </span>
          )}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
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
  loading?: boolean;
  loadingText?: string;
  error?: string | null;
  onRetry?: () => void;
  empty?: boolean;
  emptyText?: string;
  children: ReactNode;
}) {
  if (loading) {
    return (
      <div
        className={`${stateShellClass} text-[var(--color-text-muted)]`}
        aria-busy="true"
        aria-live="polite"
      >
        <Spinner size="md" />
        <span className="text-sm">{loadingText ?? "Carregando..."}</span>
      </div>
    );
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
    );
  }
  if (empty) {
    return (
      <div className={stateShellClass}>
        <p className="text-sm text-[var(--color-text-muted)]">
          {emptyText ?? "Nenhum resultado."}
        </p>
      </div>
    );
  }
  return <div className="content-reveal w-full min-w-0">{children}</div>;
}

/** Standard data table with consistent th/td styling */
export const tableStyles = {
  wrapper: "overflow-x-auto",
  table: "w-full text-sm border-collapse",
  th: "px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-[0.06em] text-[var(--color-text-muted)] border-b border-[var(--color-border)] bg-[var(--color-surface-subtle)] whitespace-nowrap",
  td: "px-6 py-4 text-[var(--color-text-primary)] border-b border-[var(--color-border)]",
  trHover: "hover:bg-[var(--color-surface-subtle)] transition-colors",
  actionsCell: "px-6 py-3.5 text-right border-b border-[var(--color-border)]",
};
