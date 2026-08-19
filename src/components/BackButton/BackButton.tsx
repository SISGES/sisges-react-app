import { Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";

interface BackButtonProps {
  to: string;
}

export function BackButton({ to }: BackButtonProps) {
  return (
    <Link
      to={to}
      aria-label="Voltar"
      className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
    >
      <FiArrowLeft size={18} />
    </Link>
  );
}
