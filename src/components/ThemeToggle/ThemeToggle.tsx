import { FiSun, FiMoon } from 'react-icons/fi'
import { useTheme } from '../../contexts/ThemeContext'

export function ThemeToggle() {
  const { mode, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Alternar para modo ${mode === 'light' ? 'escuro' : 'claro'}`}
      title={`Modo atual: ${mode === 'light' ? 'Claro' : 'Escuro'}`}
      className="flex items-center justify-center w-9 h-9 rounded-md bg-transparent border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-text-muted)] transition-colors cursor-pointer"
    >
      {mode === 'light' ? <FiMoon size={18} /> : <FiSun size={18} />}
    </button>
  )
}
