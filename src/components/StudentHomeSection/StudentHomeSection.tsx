import { useState, useEffect, useCallback } from 'react'
import { getMaterials } from '../../services/materialService'
import { getMyActivities } from '../../services/activityService'
import {
  getMyClass,
  getMyAbsencesByDiscipline,
  type MyClassResponse,
  type DisciplineAbsenceRow,
} from '../../services/studentPortalService'
import type { DisciplineMaterial } from '../../services/materialService'
import type { EvaluativeActivity } from '../../services/activityService'
import { Spinner } from '../ui/FormField'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'
const UPLOAD_BASE = API_BASE.replace('/api', '')

export type StudentHomeSectionVariant = 'all' | 'materials' | 'class' | 'absences'
export interface StudentHomeSectionProps { variant?: StudentHomeSectionVariant }

function SectionCard({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg overflow-hidden">
      {title && (
        <div className="px-5 py-3 border-b border-[var(--color-border)]">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">{title}</h3>
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  )
}

const tableClass = 'w-full text-sm border-collapse'
const thClass = 'text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)] pb-2 border-b border-[var(--color-border)]'
const tdClass = 'py-2 border-b border-[var(--color-border)] text-[var(--color-text-primary)] last:border-0'

export function StudentHomeSection({ variant = 'all' }: StudentHomeSectionProps) {
  const [materials, setMaterials] = useState<DisciplineMaterial[]>([])
  const [activities, setActivities] = useState<EvaluativeActivity[]>([])
  const [myClass, setMyClass] = useState<MyClassResponse | null>(null)
  const [absencesByDiscipline, setAbsencesByDiscipline] = useState<DisciplineAbsenceRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      if (variant === 'class') {
        setMyClass(await getMyClass())
      } else if (variant === 'absences') {
        const [turma, faltas] = await Promise.all([getMyClass(), getMyAbsencesByDiscipline()])
        setMyClass(turma)
        setAbsencesByDiscipline(faltas)
      } else if (variant === 'materials') {
        const [mats, acts] = await Promise.all([getMaterials(), getMyActivities()])
        setMaterials(mats)
        setActivities(acts)
      } else {
        const [mats, acts, turma, faltas] = await Promise.all([
          getMaterials(), getMyActivities(), getMyClass(), getMyAbsencesByDiscipline(),
        ])
        setMaterials(mats)
        setActivities(acts)
        setMyClass(turma)
        setAbsencesByDiscipline(faltas)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar.')
    } finally {
      setIsLoading(false)
    }
  }, [variant])

  useEffect(() => { fetchData() }, [fetchData])

  const getFileUrl = (path: string | null) =>
    path ? (path.startsWith('http') ? path : `${UPLOAD_BASE}${path}`) : null

  const showMaterials = variant === 'all' || variant === 'materials'
  const showClass = variant === 'all' || variant === 'class'
  const showAbsences = variant === 'all' || variant === 'absences'

  if (isLoading) {
    return (
      <div
        className="flex min-h-[min(50vh,22rem)] w-full flex-col items-center justify-center gap-3 py-12 text-[var(--color-text-muted)]"
        aria-busy="true"
        aria-live="polite"
      >
        <Spinner size="md" />
        <span className="text-sm">Carregando...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[min(50vh,22rem)] w-full flex-col items-center justify-center gap-3 py-12 text-center text-[var(--color-error)]">
        <p className="text-sm">{error}</p>
        <button
          type="button"
          onClick={fetchData}
          className="text-sm px-3 py-1.5 border border-[var(--color-border)] rounded-md bg-transparent text-[var(--color-text-primary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] cursor-pointer transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  return (
    <div className="content-reveal flex flex-col gap-4">
      {showMaterials && (
        <>
          <SectionCard title="Materiais de Estudo">
            {materials.length === 0 ? (
              <p className="text-sm text-[var(--color-text-muted)]">Nenhum material disponível.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {materials.map((m) => (
                  <li key={m.id} className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-[var(--color-text-primary)]">{m.title}</span>
                    <span className="text-xs text-[var(--color-text-muted)]">{m.disciplineName}</span>
                    {m.filePath && (
                      <a
                        href={getFileUrl(m.filePath) ?? '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[var(--color-primary)] hover:underline"
                      >
                        Baixar
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          <SectionCard title="Atividades Avaliativas">
            {activities.length === 0 ? (
              <p className="text-sm text-[var(--color-text-muted)]">Nenhuma atividade disponível.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {activities.map((a) => (
                  <li key={a.id} className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-[var(--color-text-primary)]">{a.title}</span>
                    {a.description && <span className="text-xs text-[var(--color-text-muted)]">{a.description}</span>}
                    {a.filePath && (
                      <a
                        href={getFileUrl(a.filePath) ?? '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[var(--color-primary)] hover:underline"
                      >
                        Baixar
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </>
      )}

      {showClass && (
        <SectionCard title={variant !== 'class' ? 'Minha turma' : undefined}>
          {!myClass?.className ? (
            <p className="text-sm text-[var(--color-text-muted)]">Nenhuma turma vinculada à sua conta.</p>
          ) : (
            <div className="flex flex-col gap-5">
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                {myClass.className}{myClass.academicYear ? ` · ${myClass.academicYear}` : ''}
              </p>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)] mb-3">Colegas</h4>
                {myClass.classmates.length === 0 ? (
                  <p className="text-sm text-[var(--color-text-muted)]">Não há outros alunos nesta turma.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className={tableClass}>
                      <thead><tr><th className={thClass}>Nome</th><th className={thClass}>E-mail</th></tr></thead>
                      <tbody>
                        {myClass.classmates.map((c) => (
                          <tr key={c.id}>
                            <td className={tdClass}>{c.name}</td>
                            <td className={tdClass}>
                              <a href={`mailto:${c.email}`} className="text-[var(--color-primary)] hover:underline">{c.email}</a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)] mb-3">Professores</h4>
                {myClass.teachers.length === 0 ? (
                  <p className="text-sm text-[var(--color-text-muted)]">Nenhum professor vinculado à turma.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className={tableClass}>
                      <thead><tr><th className={thClass}>Nome</th><th className={thClass}>E-mail</th></tr></thead>
                      <tbody>
                        {myClass.teachers.map((t) => (
                          <tr key={t.id}>
                            <td className={tdClass}>{t.name}</td>
                            <td className={tdClass}>
                              <a href={`mailto:${t.email}`} className="text-[var(--color-primary)] hover:underline">{t.email}</a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </SectionCard>
      )}

      {showAbsences && (
        <SectionCard title={variant !== 'absences' ? 'Faltas por disciplina' : undefined}>
          <p className="text-sm text-[var(--color-text-muted)] mb-4">
            Total de aulas registradas como falta em cada componente curricular.
          </p>
          {!myClass?.className ? (
            <p className="text-sm text-[var(--color-text-muted)]">Disponível quando você estiver vinculado a uma turma.</p>
          ) : absencesByDiscipline.length === 0 ? (
            <p className="text-sm text-[var(--color-text-muted)]">Nenhuma disciplina na turma.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className={tableClass}>
                <thead>
                  <tr>
                    <th className={thClass}>Disciplina</th>
                    <th className={`${thClass} text-right`}>Número de faltas</th>
                  </tr>
                </thead>
                <tbody>
                  {absencesByDiscipline.map((row, i) => (
                    <tr key={`${row.disciplineName}-${i}`}>
                      <td className={tdClass}>{row.disciplineName}</td>
                      <td className={`${tdClass} text-right font-medium`}>{row.absenceCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>
      )}
    </div>
  )
}
