import { useState, FormEvent } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { ApiError } from '../../services/authService'
import { ThemeToggle } from '../ThemeToggle/ThemeToggle'
import { Alert, Input, Spinner } from '../ui'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      await login({ email, password })
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/'
      navigate(from, { replace: true })
    } catch (err) {
      if (err instanceof ApiError) {
        switch (err.code) {
          case 'AUTH_INVALID_CREDENTIALS':
            setError(err.message)
            break
          case 'VALIDATION_ERROR':
            setError(err.errors?.map((e) => e.message).join(', ') || err.message)
            break
          default:
            setError(err.message)
        }
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Erro ao fazer login. Verifique suas credenciais.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] px-4 py-12">
      {/* Theme toggle — top right */}
      <div className="fixed top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm">
        {/* Logo / header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text-primary)]">SISGES</h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">Sistema de Gestão Escolar</p>
        </div>

        {/* Card */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-md p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {error && <Alert type="error">{error}</Alert>}

            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-[var(--color-text-primary)]">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Insira seu email"
                required
                autoComplete="email"
                disabled={isLoading}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium text-[var(--color-text-primary)]">
                Senha
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                required
                autoComplete="current-password"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 mt-1 text-sm font-semibold rounded-lg bg-[var(--color-primary)] text-white border border-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] hover:border-[var(--color-primary-hover)] transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading && <Spinner size="sm" />}
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
