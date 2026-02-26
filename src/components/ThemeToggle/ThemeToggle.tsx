import { FiSun, FiMoon } from 'react-icons/fi'
import { useTheme } from '../../contexts/ThemeContext'
import './ThemeToggle.css'

export function ThemeToggle() {
  const { mode, toggleTheme } = useTheme()

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={`Alternar para modo ${mode === 'light' ? 'escuro' : 'claro'}`}
      title={`Modo atual: ${mode === 'light' ? 'Claro' : 'Escuro'}`}
    >
      {mode === 'light' ? (
        <FiMoon size={20} />
      ) : (
        <FiSun size={20} />
      )}
    </button>
  )
}
