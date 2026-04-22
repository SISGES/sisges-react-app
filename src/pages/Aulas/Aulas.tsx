import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiInfo, FiPlus } from 'react-icons/fi'
import { BackButton } from '../../components/BackButton/BackButton'
import { searchAulas, searchClasses, getDisciplines, searchTeachers } from '../../services/userService'
import { ApiError } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import type { AulaSearchResponse, AulaSearchFilters, ClassSearchResponse, DisciplineResponse, TeacherSearchResponse } from '../../types/auth'
import { PageHeader, Button, DataCard, StateBlock, tableStyles } from '../../components/ui'

const selectCls = 'px-3 py-2 text-sm bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] transition-colors'

export function Aulas() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [aulas, setAulas] = useState<AulaSearchResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<AulaSearchFilters>({})
  const [schoolClasses, setSchoolClasses] = useState<ClassSearchResponse[]>([])
  const [disciplines, setDisciplines] = useState<DisciplineResponse[]>([])
  const [teachers, setTeachers] = useState<TeacherSearchResponse[]>([])

  const isAdmin = user?.role === 'ADMIN'
  const isTeacher = user?.role === 'TEACHER'

  const fetchAulas = useCallback(async () => {
    setIsLoading(true); setError(null)
    try { setAulas(await searchAulas(filters)) }
    catch (err) { setError(err instanceof ApiError ? err.message : err instanceof Error ? err.message : 'Erro ao carregar aulas.') }
    finally { setIsLoading(false) }
  }, [filters])

  const fetchOptions = useCallback(async () => {
    if (!isAdmin) return
    try {
      const [c, d, t] = await Promise.all([searchClasses(), getDisciplines(), searchTeachers()])
      setSchoolClasses(c); setDisciplines(d); setTeachers(t)
    } catch { void 0 }
  }, [isAdmin])

  useEffect(() => { fetchAulas() }, [fetchAulas])
  useEffect(() => { fetchOptions() }, [fetchOptions])

  const formatDate = (dateStr: string) => {
    try { return new Date(dateStr).toLocaleDateString('pt-BR') }
    catch { return dateStr }
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <PageHeader
        title="Aulas"
        back={<BackButton to="/" />}
        action={
          isTeacher ? (
            <Button size="sm" icon={<FiPlus size={14} />} onClick={() => navigate('/aulas/new')}>
              Nova aula
            </Button>
          ) : undefined
        }
      />

      {/* Admin filters */}
      {isAdmin && (
        <div className="flex flex-wrap items-center gap-3 px-6 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
          <input
            type="date"
            value={filters.date || ''}
            onChange={(e) => setFilters((p) => ({ ...p, date: e.target.value || undefined }))}
            className={selectCls}
          />
          <select
            value={filters.disciplineId ?? ''}
            onChange={(e) => setFilters((p) => ({ ...p, disciplineId: e.target.value ? parseInt(e.target.value, 10) : undefined }))}
            className={selectCls}
          >
            <option value="">Todas as disciplinas</option>
            {disciplines.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <select
            value={filters.schoolClassId ?? ''}
            onChange={(e) => setFilters((p) => ({ ...p, schoolClassId: e.target.value ? parseInt(e.target.value, 10) : undefined }))}
            className={selectCls}
          >
            <option value="">Todas as turmas</option>
            {schoolClasses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select
            value={filters.teacherId ?? ''}
            onChange={(e) => setFilters((p) => ({ ...p, teacherId: e.target.value ? parseInt(e.target.value, 10) : undefined }))}
            className={selectCls}
          >
            <option value="">Todos os professores</option>
            {teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <button
            onClick={() => setFilters({})}
            className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] bg-transparent border-none cursor-pointer transition-colors px-1"
          >
            Limpar
          </button>
        </div>
      )}

      <div className="flex-1 p-6">
        <DataCard
          title="Lista de Aulas"
          count={!isLoading && !error ? aulas.length : undefined}
          countLabel={aulas.length === 1 ? 'aula' : 'aulas'}
        >
          <StateBlock
            loading={isLoading}
            loadingText="Carregando aulas..."
            error={error}
            onRetry={fetchAulas}
            empty={aulas.length === 0}
            emptyText="Nenhuma aula encontrada."
          >
            <div className={tableStyles.wrapper}>
              <table className={tableStyles.table}>
                <thead>
                  <tr>
                    {['Data', 'Horário', 'Disciplina', 'Turma', 'Professor', 'Ações'].map((h) => (
                      <th key={h} className={tableStyles.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {aulas.map((a) => (
                    <tr key={a.id} className={tableStyles.trHover}>
                      <td className={tableStyles.td}>{formatDate(a.date)}</td>
                      <td className={tableStyles.td}>{a.startTime} – {a.endTime}</td>
                      <td className={tableStyles.td}>{a.disciplineName}</td>
                      <td className={tableStyles.td}>{a.schoolClassName}</td>
                      <td className={tableStyles.td}>{a.teacherName}</td>
                      <td className={tableStyles.actionsCell}>
                        <button
                          type="button"
                          onClick={() => navigate(`/aulas/${a.id}`)}
                          title="Detalhes"
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
