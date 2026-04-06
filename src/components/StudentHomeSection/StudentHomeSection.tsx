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
import './StudentHomeSection.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'
const UPLOAD_BASE = API_BASE.replace('/api', '')

export type StudentHomeSectionVariant = 'all' | 'materials' | 'class' | 'absences'

export interface StudentHomeSectionProps {
  variant?: StudentHomeSectionVariant
}

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
        const turma = await getMyClass()
        setMyClass(turma)
      } else if (variant === 'absences') {
        const [turma, faltas] = await Promise.all([
          getMyClass(),
          getMyAbsencesByDiscipline(),
        ])
        setMyClass(turma)
        setAbsencesByDiscipline(faltas)
      } else if (variant === 'materials') {
        const [mats, acts] = await Promise.all([getMaterials(), getMyActivities()])
        setMaterials(mats)
        setActivities(acts)
      } else {
        const [mats, acts, turma, faltas] = await Promise.all([
          getMaterials(),
          getMyActivities(),
          getMyClass(),
          getMyAbsencesByDiscipline(),
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

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const getFileUrl = (path: string | null) =>
    path ? (path.startsWith('http') ? path : `${UPLOAD_BASE}${path}`) : null

  const showMaterials = variant === 'all' || variant === 'materials'
  const showClass = variant === 'all' || variant === 'class'
  const showAbsences = variant === 'all' || variant === 'absences'

  if (isLoading) {
    return (
      <div className="student-home-section">
        <div className="student-home-loading">
          <div className="loading-spinner-sm"></div>
          <span>Carregando...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="student-home-section">
        <div className="student-home-error">
          <p>{error}</p>
          <button type="button" onClick={fetchData} className="btn-retry">
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="student-home-section">
      <div className="student-home-grid">
        {showMaterials && (
          <>
            <div className="student-home-card">
              <h3>Materiais de Estudo</h3>
              {materials.length === 0 ? (
                <p className="student-home-empty">Nenhum material disponível.</p>
              ) : (
                <ul className="student-home-list">
                  {materials.map((m) => (
                    <li key={m.id}>
                      <strong>{m.title}</strong>
                      <span className="student-home-meta">{m.disciplineName}</span>
                      {m.filePath && (
                        <a
                          href={getFileUrl(m.filePath) ?? '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="student-home-link"
                        >
                          Baixar
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="student-home-card">
              <h3>Atividades Avaliativas</h3>
              {activities.length === 0 ? (
                <p className="student-home-empty">Nenhuma atividade disponível.</p>
              ) : (
                <ul className="student-home-list">
                  {activities.map((a) => (
                    <li key={a.id}>
                      <strong>{a.title}</strong>
                      {a.description && (
                        <span className="student-home-desc">{a.description}</span>
                      )}
                      {a.filePath && (
                        <a
                          href={getFileUrl(a.filePath) ?? '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="student-home-link"
                        >
                          Baixar
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}

        {showClass && (
          <div className="student-home-card">
            {variant !== 'class' && <h3>Minha turma</h3>}
            {!myClass?.className ? (
              <p className="student-home-empty">Nenhuma turma vinculada à sua conta.</p>
            ) : (
              <>
                <p className="student-home-class-meta">
                  {myClass.className}
                  {myClass.academicYear ? ` · ${myClass.academicYear}` : ''}
                </p>
                <h4 className="student-home-subheading">Colegas</h4>
                {myClass.classmates.length === 0 ? (
                  <p className="student-home-empty">Não há outros alunos nesta turma.</p>
                ) : (
                  <div className="student-home-table-wrap">
                    <table className="student-home-table">
                      <thead>
                        <tr>
                          <th>Nome</th>
                          <th>E-mail</th>
                        </tr>
                      </thead>
                      <tbody>
                        {myClass.classmates.map((c) => (
                          <tr key={c.id}>
                            <td>{c.name}</td>
                            <td>
                              <a href={`mailto:${c.email}`} className="student-home-mail">
                                {c.email}
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <h4 className="student-home-subheading">Professores</h4>
                {myClass.teachers.length === 0 ? (
                  <p className="student-home-empty">Nenhum professor vinculado à turma.</p>
                ) : (
                  <div className="student-home-table-wrap">
                    <table className="student-home-table">
                      <thead>
                        <tr>
                          <th>Nome</th>
                          <th>E-mail</th>
                        </tr>
                      </thead>
                      <tbody>
                        {myClass.teachers.map((t) => (
                          <tr key={t.id}>
                            <td>{t.name}</td>
                            <td>
                              <a href={`mailto:${t.email}`} className="student-home-mail">
                                {t.email}
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {showAbsences && (
          <div className="student-home-card">
            {variant !== 'absences' && <h3>Faltas por disciplina</h3>}
            <p className="student-home-section-lead">
              Total de aulas registradas como falta em cada componente curricular.
            </p>
            {!myClass?.className ? (
              <p className="student-home-empty">Disponível quando você estiver vinculado a uma turma.</p>
            ) : absencesByDiscipline.length === 0 ? (
              <p className="student-home-empty">Nenhuma disciplina na turma.</p>
            ) : (
              <div className="student-home-table-wrap">
                <table className="student-home-table">
                  <thead>
                    <tr>
                      <th>Disciplina</th>
                      <th className="student-home-th-narrow">Número de faltas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {absencesByDiscipline.map((row, i) => (
                      <tr key={`${row.disciplineName}-${i}`}>
                        <td>{row.disciplineName}</td>
                        <td className="student-home-td-center">{row.absenceCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
