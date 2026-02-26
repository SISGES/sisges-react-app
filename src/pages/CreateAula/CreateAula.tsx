import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { BackButton } from '../../components/BackButton/BackButton'
import { createAula, getTeacherMe, getClassById, searchAulas } from '../../services/userService'
import { ApiError } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import type { DisciplineSimple } from '../../types/auth'
import './CreateAula.css'

/** Retorna a data de hoje em dd/mm/aaaa */
function getTodayBr(): string {
  const now = new Date()
  const d = String(now.getDate()).padStart(2, '0')
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const y = now.getFullYear()
  return `${d}/${m}/${y}`
}

/** Converte dd/mm/aaaa para yyyy-mm-dd (formato API) */
function dateBrToIso(value: string): string {
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!match) return ''
  const [, d, m, y] = match
  const day = parseInt(d!, 10)
  const month = parseInt(m!, 10)
  const year = parseInt(y!, 10)
  if (day < 1 || day > 31 || month < 1 || month > 12) return ''
  return `${year}-${m}-${d}`
}

/** Aplica máscara dd/mm/aaaa ao digitar */
function formatDateInput(value: string): string {
  const digits = value.replace(/\D/g, '')
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`
}

/** Converte minutos desde meia-noite para "HH:mm" */
function minsToTime(mins: number): string {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/** Converte "HH:mm" ou "HH:mm:ss" para minutos desde meia-noite */
function timeToMins(t: string): number {
  const parts = t.split(':')
  const h = parseInt(parts[0] || '0', 10)
  const m = parseInt(parts[1] || '0', 10)
  return h * 60 + m
}

/** Verifica se dois intervalos de horário se sobrepõem */
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

interface TeacherDisciplineOption {
  discipline: DisciplineSimple
  schoolClassIds: number[]
}

export function CreateAula() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const isTeacher = user?.role === 'TEACHER'
  const teacherId = isTeacher ? user?.id ?? null : null

  const [disciplineOptions, setDisciplineOptions] = useState<TeacherDisciplineOption[]>([])
  const [schoolClassOptions, setSchoolClassOptions] = useState<{ id: number; name: string }[]>([])
  const [isLoadingOptions, setIsLoadingOptions] = useState(true)
  const [optionsError, setOptionsError] = useState<string | null>(null)

  const [date, setDate] = useState('')
  const [isToday, setIsToday] = useState(false)
  const [disciplineId, setDisciplineId] = useState<number | ''>('')
  const [schoolClassId, setSchoolClassId] = useState<number | ''>('')
  const [startHour, setStartHour] = useState<number>(8)
  const [startMinute, setStartMinute] = useState<number>(0)
  const [endHour, setEndHour] = useState<number>(9)
  const [endMinute, setEndMinute] = useState<number>(0)
  const [timeError, setTimeError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const startTime = minsToTime(startHour * 60 + startMinute)
  const endTime = minsToTime(endHour * 60 + endMinute)

  const fetchOptions = useCallback(async () => {
    if (!teacherId) return
    setIsLoadingOptions(true)
    setOptionsError(null)
    try {
      const teacher = await getTeacherMe()
      const classIds = teacher.classes?.map((c) => c.id) ?? []
      const classDetails = await Promise.all(
        classIds.map((id) => getClassById(id).catch(() => null))
      )
      const disciplineMap = new Map<number, number[]>()
      for (let i = 0; i < classDetails.length; i++) {
        const c = classDetails[i]
        if (!c || !c.disciplines) continue
        const classId = classIds[i]
        for (const d of c.disciplines) {
          if (!disciplineMap.has(d.id)) {
            disciplineMap.set(d.id, [])
          }
          disciplineMap.get(d.id)!.push(classId)
        }
      }
      const options: TeacherDisciplineOption[] = []
      const seen = new Set<number>()
      for (const c of classDetails) {
        if (!c?.disciplines) continue
        for (const d of c.disciplines) {
          if (seen.has(d.id)) continue
          seen.add(d.id)
          const schoolClassIds = disciplineMap.get(d.id) ?? []
          options.push({ discipline: d, schoolClassIds })
        }
      }
      setDisciplineOptions(options)
      if (options.length === 1 && options[0].schoolClassIds.length > 0) {
        setDisciplineId(options[0].discipline.id)
        const classNames = await Promise.all(
          options[0].schoolClassIds.map((id) =>
            getClassById(id).then((cc) => ({ id: cc.id, name: cc.name }))
          )
        )
        setSchoolClassOptions(classNames)
        if (classNames.length === 1) {
          setSchoolClassId(classNames[0].id)
        }
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setOptionsError(err.message)
      } else {
        setOptionsError('Erro ao carregar opções.')
      }
    } finally {
      setIsLoadingOptions(false)
    }
  }, [teacherId])

  useEffect(() => {
    if (isTeacher) {
      fetchOptions()
    }
  }, [isTeacher, fetchOptions])

  useEffect(() => {
    if (disciplineId === '') {
      setSchoolClassOptions([])
      setSchoolClassId('')
      return
    }
    const opt = disciplineOptions.find((o) => o.discipline.id === disciplineId)
    if (!opt) return
    const loadClasses = async () => {
      const classes: { id: number; name: string }[] = []
      for (const id of opt.schoolClassIds) {
        try {
          const c = await getClassById(id)
          classes.push({ id: c.id, name: c.name })
        } catch {
          // skip
        }
      }
      setSchoolClassOptions(classes)
      setSchoolClassId(classes.length === 1 ? classes[0].id : '')
    }
    loadClasses()
  }, [disciplineId, disciplineOptions])

  const isTimeValid = timeToMins(endTime) > timeToMins(startTime)
  const isDateValid = /^\d{2}\/\d{2}\/\d{4}$/.test(date)

  useEffect(() => {
    if (startTime && endTime) {
      setTimeError(
        timeToMins(endTime) <= timeToMins(startTime)
          ? 'O horário de fim deve ser maior que o de início.'
          : null
      )
    } else {
      setTimeError(null)
    }
  }, [startHour, startMinute, endHour, endMinute])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!disciplineId || !schoolClassId || !date || !isTimeValid || !isDateValid) return
    const dateIso = dateBrToIso(date)
    if (!dateIso) return
    setSubmitError(null)
    setIsSubmitting(true)
    try {
      const existingAulas = await searchAulas({
        date: dateIso,
        schoolClassId: Number(schoolClassId),
      })
      const hasOverlap = (existingAulas ?? []).some((a) =>
        timesOverlap(startTime, endTime, a.startTime ?? '', a.endTime ?? '')
      )
      if (hasOverlap) {
        setSubmitError('Já existe uma aula cadastrada nesta turma no mesmo dia com horário sobreposto.')
        setIsSubmitting(false)
        return
      }
      await createAula({
        date: dateIso,
        disciplineId: Number(disciplineId),
        classId: Number(schoolClassId),
        startTime,
        endTime,
      })
      navigate('/aulas')
    } catch (err) {
      if (err instanceof ApiError) {
        setSubmitError(err.message)
      } else if (err instanceof Error) {
        setSubmitError(err.message)
      } else {
        setSubmitError('Erro ao criar aula.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (user?.role !== 'TEACHER') {
    return (
      <div className="create-aula-container">
        <header className="create-aula-header">
          <div className="create-aula-header-content">
            <BackButton to="/aulas" />
            <h1>Nova Aula</h1>
          </div>
        </header>
        <div className="create-aula-content">
          <p>Apenas professores podem criar aulas.</p>
        </div>
      </div>
    )
  }

  if (isLoadingOptions) {
    return (
      <div className="create-aula-container">
        <header className="create-aula-header">
          <div className="create-aula-header-content">
            <BackButton to="/aulas" />
            <h1>Nova Aula</h1>
          </div>
        </header>
        <div className="create-aula-loading">
          <div className="loading-spinner-sm"></div>
          <span>Carregando opções...</span>
        </div>
      </div>
    )
  }

  if (optionsError || disciplineOptions.length === 0) {
    return (
      <div className="create-aula-container">
        <header className="create-aula-header">
          <div className="create-aula-header-content">
            <BackButton to="/aulas" />
            <h1>Nova Aula</h1>
          </div>
        </header>
        <div className="create-aula-content">
          <div className="create-aula-error">
            <p>{optionsError || 'Você não possui disciplinas ou turmas vinculadas para criar aulas.'}</p>
            <button onClick={() => navigate('/aulas')} className="btn-secondary">
              Voltar
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="create-aula-container">
      <header className="create-aula-header">
        <div className="create-aula-header-content">
          <BackButton to="/aulas" />
          <h1>Nova Aula</h1>
        </div>
      </header>

      <div className="create-aula-content">
        <div className="create-aula-card">
          <form onSubmit={handleSubmit} className="create-aula-form">
            {submitError && (
              <div className="alert-error" role="alert">
                {submitError}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="date" className="form-label">Data *</label>
              <div className="date-input-row">
                <input
                  id="date"
                  type="text"
                  value={date}
                  onChange={(e) => {
                    setDate(formatDateInput(e.target.value))
                    if (isToday) setIsToday(false)
                  }}
                  className="form-input"
                  placeholder="dd/mm/aaaa"
                  maxLength={10}
                  required
                  disabled={isSubmitting}
                />
                <label className="checkbox-option date-hoje-option">
                  <input
                    type="checkbox"
                    checked={isToday}
                    onChange={(e) => {
                      const checked = e.target.checked
                      setIsToday(checked)
                      setDate(checked ? getTodayBr() : '')
                    }}
                    disabled={isSubmitting}
                  />
                  <span>Hoje</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="discipline" className="form-label">Disciplina *</label>
              <select
                id="discipline"
                value={disciplineId}
                onChange={(e) => setDisciplineId(e.target.value ? parseInt(e.target.value, 10) : '')}
                className="form-select"
                required
                disabled={isSubmitting || disciplineOptions.length === 1}
              >
                <option value="">Selecione a disciplina</option>
                {disciplineOptions.map((o) => (
                  <option key={o.discipline.id} value={o.discipline.id}>
                    {o.discipline.name}
                  </option>
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
                disabled={isSubmitting || schoolClassOptions.length === 0 || schoolClassOptions.length === 1}
              >
                <option value="">Selecione a turma</option>
                {schoolClassOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Horário início *</label>
                <div className="time-picker">
                  <select
                    value={startHour}
                    onChange={(e) => setStartHour(parseInt(e.target.value, 10))}
                    className="form-select time-select"
                    disabled={isSubmitting}
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>
                        {String(i).padStart(2, '0')}h
                      </option>
                    ))}
                  </select>
                  <span className="time-sep">:</span>
                  <select
                    value={startMinute}
                    onChange={(e) => setStartMinute(parseInt(e.target.value, 10))}
                    className="form-select time-select"
                    disabled={isSubmitting}
                  >
                    {Array.from({ length: 60 }, (_, i) => (
                      <option key={i} value={i}>
                        {String(i).padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Horário fim *</label>
                <div className="time-picker">
                  <select
                    value={endHour}
                    onChange={(e) => setEndHour(parseInt(e.target.value, 10))}
                    className="form-select time-select"
                    disabled={isSubmitting}
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>
                        {String(i).padStart(2, '0')}h
                      </option>
                    ))}
                  </select>
                  <span className="time-sep">:</span>
                  <select
                    value={endMinute}
                    onChange={(e) => setEndMinute(parseInt(e.target.value, 10))}
                    className="form-select time-select"
                    disabled={isSubmitting}
                  >
                    {Array.from({ length: 60 }, (_, i) => (
                      <option key={i} value={i}>
                        {String(i).padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            {timeError && (
              <div className="alert-error" role="alert">
                {timeError}
              </div>
            )}

            <div className="form-actions">
              <button type="button" onClick={() => navigate('/aulas')} className="btn-secondary" disabled={isSubmitting}>
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting || !isTimeValid || !isDateValid}
              >
                {isSubmitting ? 'Criando...' : 'Criar Aula'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
