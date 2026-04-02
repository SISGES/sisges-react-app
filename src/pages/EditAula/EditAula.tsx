import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { IoClose } from 'react-icons/io5'
import { BackButton } from '../../components/BackButton/BackButton'
import {
  getAulaById,
  updateAula,
  submitAulaFrequency,
  getTeacherById,
  getClassById,
  getDisciplines,
  searchClasses,
  searchAulas,
} from '../../services/userService'
import { ApiError } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import type {
  AulaDetailResponse,
  DisciplineSimple,
} from '../../types/auth'
import './EditAula.css'

function timeToMins(t: string): number {
  const parts = t.split(':')
  const h = parseInt(parts[0] || '0', 10)
  const m = parseInt(parts[1] || '0', 10)
  return h * 60 + m
}

function timesOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const s1 = timeToMins(start1)
  const e1 = timeToMins(end1)
  const s2 = timeToMins(start2)
  const e2 = timeToMins(end2)
  return s1 < e2 && s2 < e1
}

export function EditAula() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const aulaId = id ? parseInt(id, 10) : null

  const [aula, setAula] = useState<AulaDetailResponse | null>(null)
  const [disciplines, setDisciplines] = useState<DisciplineSimple[]>([])
  const [schoolClasses, setSchoolClasses] = useState<{ id: number; name: string }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [date, setDate] = useState('')
  const [disciplineId, setDisciplineId] = useState<number | ''>('')
  const [schoolClassId, setSchoolClassId] = useState<number | ''>('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const [attendance, setAttendance] = useState<Record<string, 'P' | 'F'>>({})
  const [showFrequencyModal, setShowFrequencyModal] = useState(false)
  const [isSubmittingFreq, setIsSubmittingFreq] = useState(false)
  const [freqError, setFreqError] = useState<string | null>(null)

  const isAdmin = user?.role === 'ADMIN'

  const fetchAula = useCallback(async () => {
    if (!aulaId || isNaN(aulaId)) return
    setIsLoading(true)
    setError(null)
    try {
      const data = await getAulaById(aulaId)
      setAula(data)
      if (data.date) setDate(data.date)
      if (data.startTime) setStartTime(data.startTime)
      if (data.endTime) setEndTime(data.endTime)
      if (data.disciplineId != null) setDisciplineId(data.disciplineId)
      if (data.schoolClassId != null) setSchoolClassId(data.schoolClassId)
      const initial: Record<string, 'P' | 'F'> = {}
      ;(data.students ?? []).forEach((s) => {
        initial[s.name] = 'P'
      })
      setAttendance(initial)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Erro ao carregar aula.')
      }
    } finally {
      setIsLoading(false)
    }
  }, [aulaId])

  const fetchOptions = useCallback(async () => {
    try {
      if (isAdmin) {
        const [discData, classesData] = await Promise.all([
          getDisciplines(),
          searchClasses(),
        ])
        setDisciplines(discData.map((d) => ({ id: d.id, name: d.name })))
        setSchoolClasses(classesData.map((c) => ({ id: c.id, name: c.name })))
      } else if (user?.id) {
        const teacher = await getTeacherById(user.id)
        const classIds = teacher.classes?.map((c) => c.id) ?? []
        const classDetails = await Promise.all(
          classIds.map((cid) => getClassById(cid).catch(() => null))
        )
        const discSet = new Set<number>()
        const classMap = new Map<number, number[]>()
        for (let i = 0; i < classDetails.length; i++) {
          const c = classDetails[i]
          if (!c?.disciplines) continue
          for (const d of c.disciplines) {
            discSet.add(d.id)
            if (!classMap.has(d.id)) classMap.set(d.id, [])
            classMap.get(d.id)!.push(classIds[i])
          }
        }
        const discList = Array.from(discSet).map((id) => {
          const d = classDetails.flatMap((c) => c?.disciplines ?? []).find((dd) => dd.id === id)
          return d ?? { id, name: '' }
        })
        setDisciplines(discList.filter((d) => d.name))
        if (disciplineId !== '') {
          const cids = classMap.get(Number(disciplineId)) ?? []
          const classes = await Promise.all(
            cids.map((cid) => getClassById(cid).then((cc) => ({ id: cc.id, name: cc.name })))
          )
          setSchoolClasses(classes)
        }
      }
    } catch {
      void 0
    }
  }, [isAdmin, user?.id, disciplineId])

  useEffect(() => {
    fetchAula()
  }, [fetchAula])

  useEffect(() => {
    fetchOptions()
  }, [fetchOptions])

  useEffect(() => {
    if (disciplineId === '' || isAdmin) return
    const loadClasses = async () => {
      try {
        const teacher = await getTeacherById(user!.id)
        const classIds = teacher.classes?.map((c) => c.id) ?? []
        const classDetails = await Promise.all(
          classIds.map((cid) => getClassById(cid).catch(() => null))
        )
        const validClassIds: number[] = []
        for (let i = 0; i < classDetails.length; i++) {
          const c = classDetails[i]
          if (!c?.disciplines) continue
          const hasDiscipline = c.disciplines.some((d) => d.id === disciplineId)
          if (hasDiscipline) validClassIds.push(classIds[i])
        }
        const classes = await Promise.all(
          validClassIds.map((cid) => getClassById(cid).then((cc) => ({ id: cc.id, name: cc.name })))
        )
        setSchoolClasses(classes)
        setSchoolClassId((prev) => {
          const validIds = classes.map((c) => c.id)
          return validIds.includes(prev as number) ? prev : (classes[0]?.id ?? '')
        })
      } catch {
        setSchoolClasses([])
      }
    }
    loadClasses()
  }, [disciplineId, isAdmin, user?.id])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!aulaId || !disciplineId || !schoolClassId || !date || !startTime || !endTime) return
    if (timeToMins(endTime) <= timeToMins(startTime)) {
      setSubmitError('O horário de fim deve ser maior que o de início.')
      return
    }
    setSubmitError(null)
    setIsSubmitting(true)
    try {
      const existingAulas = await searchAulas({
        date,
        schoolClassId: Number(schoolClassId),
      })
      const overlapping = (existingAulas ?? []).filter(
        (a) => a.id !== aulaId && timesOverlap(startTime, endTime, a.startTime ?? '', a.endTime ?? '')
      )
      if (overlapping.length > 0) {
        setSubmitError('Já existe uma aula cadastrada nesta turma no mesmo dia com horário sobreposto.')
        setIsSubmitting(false)
        return
      }
      await updateAula(aulaId, {
        date,
        disciplineId: Number(disciplineId),
        classId: Number(schoolClassId),
        startTime,
        endTime,
      })
      navigate(`/aulas/${aulaId}`)
    } catch (err) {
      if (err instanceof ApiError) {
        setSubmitError(err.message)
      } else {
        setSubmitError('Erro ao atualizar aula.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitFrequency = async () => {
    if (!aulaId || !aula) return
    setIsSubmittingFreq(true)
    setFreqError(null)
    try {
      const entries = (aula.students ?? []).map((s) => ({
        studentId: s.id,
        status: (attendance[s.name] ?? 'P') as 'P' | 'F',
      }))
      await submitAulaFrequency(aulaId, { entries })
      setShowFrequencyModal(false)
    } catch (err) {
      if (err instanceof ApiError) {
        setFreqError(err.message)
      } else {
        setFreqError('Erro ao lançar frequência.')
      }
    } finally {
      setIsSubmittingFreq(false)
    }
  }

  const setStudentAttendance = (studentName: string, status: 'P' | 'F') => {
    setAttendance((prev) => ({ ...prev, [studentName]: status }))
  }

  if (!aulaId || isNaN(aulaId)) {
    return <div className="edit-aula-container"><p>ID inválido.</p></div>
  }

  if (isLoading || !aula) {
    return (
      <div className="edit-aula-container">
        <header className="edit-aula-header">
          <BackButton to="/aulas" />
          <h1>Editar Aula</h1>
        </header>
        <div className="edit-aula-loading">
          <div className="loading-spinner-sm"></div>
          <span>Carregando...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="edit-aula-container">
        <header className="edit-aula-header">
          <BackButton to="/aulas" />
        </header>
        <div className="edit-aula-error">
          <p>{error}</p>
          <button onClick={() => navigate('/aulas')} className="btn-secondary">Voltar</button>
        </div>
      </div>
    )
  }

  return (
    <div className="edit-aula-container">
      <header className="edit-aula-header">
        <div className="edit-aula-header-content">
          <BackButton to={`/aulas/${aulaId}`} />
          <h1>Editar Aula</h1>
          <button onClick={() => setShowFrequencyModal(true)} className="btn-frequency">
            Lançar Frequência
          </button>
        </div>
      </header>

      <div className="edit-aula-content">
        <div className="edit-aula-card">
          <form onSubmit={handleSubmit} className="edit-aula-form">
            {submitError && <div className="alert-error">{submitError}</div>}

            <div className="form-group">
              <label htmlFor="date" className="form-label">Data *</label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="form-input"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="discipline" className="form-label">Disciplina *</label>
              <select
                id="discipline"
                value={disciplineId}
                onChange={(e) => setDisciplineId(e.target.value ? parseInt(e.target.value, 10) : '')}
                className="form-select"
                required
                disabled={isSubmitting}
              >
                <option value="">Selecione</option>
                {disciplines.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="schoolClass" className="form-label">Turma *</label>
              <select
                id="schoolClass"
                value={schoolClassId}
                onChange={(e) => setSchoolClassId(e.target.value ? parseInt(e.target.value, 10) : '')}
                className="form-select"
                required
                disabled={isSubmitting}
              >
                <option value="">Selecione</option>
                {schoolClasses.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startTime" className="form-label">Início *</label>
                <input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="form-input"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="form-group">
                <label htmlFor="endTime" className="form-label">Fim *</label>
                <input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="form-input"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="button" onClick={() => navigate(`/aulas/${aulaId}`)} className="btn-secondary" disabled={isSubmitting}>
                Cancelar
              </button>
              <button type="submit" className="btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {showFrequencyModal && (
        <div className="modal-overlay" onClick={() => !isSubmittingFreq && setShowFrequencyModal(false)}>
          <div className="modal-content frequency-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Lançar Frequência</h2>
              <button onClick={() => setShowFrequencyModal(false)} disabled={isSubmittingFreq} className="modal-close" aria-label="Fechar"><IoClose size={22} /></button>
            </div>
            <div className="modal-body">
              {freqError && <div className="alert-error">{freqError}</div>}
              <div className="frequency-list">
                {aula.students.map((s) => (
                  <div key={s.id} className="frequency-row">
                    <span>{s.name}</span>
                    <div className="frequency-options">
                      <label>
                        <input
                          type="radio"
                          name={`freq-${s.id}`}
                          checked={attendance[s.name] === 'P'}
                          onChange={() => setStudentAttendance(s.name, 'P')}
                        />
                        Presente
                      </label>
                      <label>
                        <input
                          type="radio"
                          name={`freq-${s.id}`}
                          checked={attendance[s.name] === 'F'}
                          onChange={() => setStudentAttendance(s.name, 'F')}
                        />
                        Faltoso
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowFrequencyModal(false)} className="btn-secondary" disabled={isSubmittingFreq}>
                Cancelar
              </button>
              <button onClick={handleSubmitFrequency} className="btn-primary" disabled={isSubmittingFreq}>
                {isSubmittingFreq ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
