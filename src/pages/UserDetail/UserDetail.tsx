import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { BackButton } from '../../components/BackButton/BackButton'
import { getUserById } from '../../services/userService'
import { ApiError } from '../../services/api'
import type { UserDetailResponse } from '../../types/auth'
import { PageHeader, Button, StateBlock } from '../../components/ui'

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrador',
  TEACHER: 'Professor',
  STUDENT: 'Aluno',
}

const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] border-[var(--color-primary)]/20',
  TEACHER: 'bg-[var(--color-accent)]/10 text-[var(--color-accent)] border-[var(--color-accent)]/20',
  STUDENT: 'bg-[var(--color-warning)]/10 text-[var(--color-warning)] border-[var(--color-warning)]/20',
}

export function UserDetail() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [user, setUser] = useState<UserDetailResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchUser() {
      if (!id) return
      setIsLoading(true); setError(null)
      try {
        setUser(await getUserById(parseInt(id, 10)))
      } catch (err) {
        setError(err instanceof ApiError ? err.message : err instanceof Error ? err.message : 'Erro ao carregar dados do usuário.')
      } finally {
        setIsLoading(false)
      }
    }
    fetchUser()
  }, [id])

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '-'
    const [year, month, day] = dateStr.split('-')
    return `${day}/${month}/${year}`
  }

  function getInitials(name: string): string {
    const parts = name.trim().split(' ').filter(Boolean)
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    return parts[0]?.[0]?.toUpperCase() ?? '?'
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <PageHeader title="Detalhes do Usuário" back={<BackButton to="/" />} />

      <div className="flex-1 p-6">
        <StateBlock loading={isLoading} loadingText="Carregando..." error={error}>
          {user && (
            <div className="max-w-md mx-auto">
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-8 flex flex-col items-center gap-5">
                {/* Avatar */}
                <div className="w-16 h-16 rounded-full bg-[var(--color-primary)] text-white text-xl font-semibold flex items-center justify-center flex-shrink-0">
                  {getInitials(user.name)}
                </div>

                {/* Name + role */}
                <div className="text-center flex flex-col items-center gap-2">
                  <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">{user.name}</h2>
                  <span className={[
                    'px-2.5 py-0.5 text-xs font-medium rounded-full border',
                    ROLE_COLORS[user.role] ?? 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)]',
                  ].join(' ')}>
                    {ROLE_LABELS[user.role] || user.role}
                  </span>
                </div>

                {/* Info rows */}
                <div className="w-full border-t border-[var(--color-border)] pt-5 flex flex-col gap-3">
                  {[
                    { label: 'E-mail', value: user.email },
                    { label: 'Matrícula', value: user.register },
                    { label: 'Gênero', value: user.gender },
                    { label: 'Data de Nascimento', value: formatDate(user.birthDate) },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-start justify-between gap-4">
                      <span className="text-sm text-[var(--color-text-muted)] flex-shrink-0">{label}</span>
                      <span className="text-sm text-[var(--color-text-primary)] text-right">{value}</span>
                    </div>
                  ))}
                </div>

                <Button variant="secondary" onClick={() => navigate(-1)} className="w-full mt-2">
                  Voltar
                </Button>
              </div>
            </div>
          )}
        </StateBlock>
      </div>
    </div>
  )
}
