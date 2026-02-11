import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { lightTheme, darkTheme, Theme } from '../themes/colors'

type ThemeMode = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  mode: ThemeMode
  toggleTheme: () => void
  setTheme: (mode: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(() => {
    // Verifica preferência salva no localStorage ou preferência do sistema
    const saved = localStorage.getItem('theme') as ThemeMode | null
    if (saved) return saved
    
    // Verifica preferência do sistema
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
    return 'light'
  })

  const theme = mode === 'dark' ? darkTheme : lightTheme

  useEffect(() => {
    // Aplica o tema ao documento
    document.documentElement.setAttribute('data-theme', mode)
    localStorage.setItem('theme', mode)
    
    // Aplica as variáveis CSS
    const root = document.documentElement
    Object.entries(theme).forEach(([key, value]) => {
      const cssVar = `--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`
      root.style.setProperty(cssVar, value)
    })
  }, [mode, theme])

  const toggleTheme = () => {
    setMode(prev => prev === 'light' ? 'dark' : 'light')
  }

  const setTheme = (newMode: ThemeMode) => {
    setMode(newMode)
  }

  return (
    <ThemeContext.Provider value={{ theme, mode, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
