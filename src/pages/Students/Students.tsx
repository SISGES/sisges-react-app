import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiInfo, FiPlus } from 'react-icons/fi'
import { BackButton } from '../../components/BackButton/BackButton'
import { searchUsers } from '../../services/userService'
import { ApiError } from '../../services/api'
import type { UserSearchResponse } from '../../types/auth'
import { PageHeader, Button, DataCard, StateBlock, tableStyles } from '../../components/ui'

export function Students() {
  const navigate = useNavigate()
  const [students, setStudents] = useState<UserSearchResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStudents = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await searchUsers()
      setStudents(data.filter((u) => u.role === 'STUDENT'))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : err instanceof Error ? err.message : 'Erro ao carregar alunos.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { fetchStudents() }, [fetchStudents])

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <PageHeader
        title="Alunos"
        back={<BackButton to="/" />}
        action={
          <Button size="sm" icon={<FiPlus size={14} />} onClick={() => navigate('/admin/register?role=STUDENT')}>
            Novo aluno
          </Button>
        }
      />

      <div className="flex-1 p-6">
        <DataCard
          title="Alunos Cadastrados"
          count={!isLoading && !error ? students.length : undefined}
          countLabel={students.length === 1 ? 'aluno' : 'alunos'}
        >
          <StateBlock
            loading={isLoading}
            loadingText="Carregando alunos..."
            error={error}
            onRetry={fetchStudents}
            empty={students.length === 0}
            emptyText="Nenhum aluno cadastrado."
          >
            <div className={tableStyles.wrapper}>
              <table className={tableStyles.table}>
                <thead>
                  <tr>
                    {['Nome', 'E-mail', 'Ações'].map((h) => (
                      <th key={h} className={tableStyles.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s.id} className={tableStyles.trHover}>
                      <td className={tableStyles.td}>{s.name}</td>
                      <td className={tableStyles.td}>{s.email}</td>
                      <td className={tableStyles.actionsCell}>
                        <button
                          type="button"
                          onClick={() => navigate(`/admin/users/${s.id}`)}
                          title="Ver detalhes"
                          aria-label={`Ver detalhes de ${s.name}`}
                          className="flex items-center justify-center w-7 h-7 rounded-md border border-[var(--color-border)] bg-transparent text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] cursor-pointer transition-colors ml-auto"
                        >
                          <FiInfo size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </StateBlock>
        </DataCard>
      </div>
    </div>
  )
}
