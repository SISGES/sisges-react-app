import { Link } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'

interface BackButtonProps {
  to: string
}

export function BackButton({ to }: BackButtonProps) {
  return (
    <Link
      to={to}
      aria-label="Voltar"
      className="flex items-center justify-center w-8 h-8 rounded-md text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-background)] transition-colors flex-shrink-0"
    >
      <FiArrowLeft size={18} />
    </Link>
  )
}
