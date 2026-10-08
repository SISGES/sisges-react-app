type PaginationProps = {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  className?: string;
};

export function Pagination({
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  className = "",
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / pageSize);

  if (totalPages <= 1) return null;

  const firstItem = (currentPage - 1) * pageSize + 1;
  const lastItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <nav
      aria-label="Paginação da lista"
      className={`flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-border)] pt-4 ${className}`}
    >
      <p className="text-sm text-[var(--color-text-muted)]" aria-live="polite">
        Exibindo {firstItem}–{lastItem} de {totalItems}
      </p>
      <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-sm font-medium text-[var(--color-text-primary)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-45"
        >
          Anterior
        </button>
        <span className="text-center text-sm leading-tight text-[var(--color-text-muted)]">
          Página {currentPage} de {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-sm font-medium text-[var(--color-text-primary)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-45"
        >
          Próxima
        </button>
      </div>
    </nav>
  );
}
