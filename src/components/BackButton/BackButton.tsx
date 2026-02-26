import { Link } from 'react-router-dom'
import './BackButton.css'

interface BackButtonProps {
  to: string
}

export function BackButton({ to }: BackButtonProps) {
  return (
    <Link to={to} className="back-button" aria-label="Voltar">
      &#8592;
    </Link>
  )
}
