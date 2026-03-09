import { useState, useEffect, useCallback } from 'react'
import { getMaterials } from '../../services/materialService'
import { getMyActivities } from '../../services/activityService'
import type { DisciplineMaterial } from '../../services/materialService'
import type { EvaluativeActivity } from '../../services/activityService'
import './StudentHomeSection.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'
const UPLOAD_BASE = API_BASE.replace('/api', '')

export function StudentHomeSection() {
  const [materials, setMaterials] = useState<DisciplineMaterial[]>([])
  const [activities, setActivities] = useState<EvaluativeActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [mats, acts] = await Promise.all([getMaterials(), getMyActivities()])
      setMaterials(mats)
      setActivities(acts)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const getFileUrl = (path: string | null) =>
    path ? (path.startsWith('http') ? path : `${UPLOAD_BASE}${path}`) : null

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
          <button onClick={fetchData} className="btn-retry">
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="student-home-section">
      <div className="student-home-grid">
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
      </div>
    </div>
  )
}
