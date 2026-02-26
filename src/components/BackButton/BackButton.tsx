import { Link } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'
import './BackButton.css'

interface BackButtonProps {
  to: string
}

export function BackButton({ to }: BackButtonProps) {
  return (
    <Link to={to} className="back-button" aria-label="Voltar">
      <FiArrowLeft size={20} />
    </Link>
  )
}
