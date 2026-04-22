import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { BackButton } from '../../components/BackButton/BackButton'
import { createAula, getTeacherMe, getClassById, searchAulas } from '../../services/userService'
import { ApiError } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import type { DisciplineSimple } from '../../types/auth'
import { PageHeader, Button, StateBlock, FormField, Select, Alert } from '../../components/ui'

function getTodayBr(): string {
  const now = new Date()
  return [String(now.getDate()).padStart(2, '0'), String(now.getMonth() + 1).padStart(2, '0'), now.getFullYear()].join('/')
}
function dateBrToIso(value: string): string {
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!match) return ''
  const [, d, m, y] = match
  const day = parseInt(d!, 10), month = parseInt(m!, 10)
  if (day < 1 || day > 31 || month < 1 || month > 12) return ''
  return `${y}-${m}-${d}`
}
function formatDateInput(value: string): string {
  const digits = value.replace(/\D/g, '')
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`
}
function minsToTime(mins: number): string {
  return `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`
}
function timeToMins(t: string): number {
  const parts = t.split(':')
  return parseInt(parts[0] || '0', 10) * 60 + parseInt(parts[1] || '0', 10)
}
function timesOverlap(s1: string, e1: string, s2: string, e2: string): boolean {
  return timeToMins(s1) < timeToMins(e2) && timeToMins(s2) < timeToMins(e1)
}

interface TeacherDisciplineOption { discipline: DisciplineSimple; schoolClassIds: number[] }

const selectCls = 'w-full px-3 py-2 text-sm bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
const inputCls = 'w-full px-3 py-2 text-sm bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] disabled:opacity-50 transition-colors'

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
  const isTimeValid = timeToMins(endTime) > timeToMins(startTime)
  const isDateValid = /^\d{2}\/\d{2}\/\d{4}$/.test(date)

  useEffect(() => {
    setTimeError(isTimeValid || !startTime || !endTime ? null : 'O horário de fim deve ser maior que o de início.')
  }, [startHour, startMinute, endHour, endMinute, isTimeValid, startTime, endTime])

  const fetchOptions = useCallback(async () => {
    if (!teacherId) return
    setIsLoadingOptions(true); setOptionsError(null)
    try {
      const teacher = await getTeacherMe()
      const classIds = teacher.classes?.map((c) => c.id) ?? []
      const classDetails = await Promise.all(classIds.map((id) => getClassById(id).catch(() => null)))
      const disciplineMap = new Map<number, number[]>()
      for (let i = 0; i < classDetails.length; i++) {
        const c = classDetails[i]
        if (!c?.disciplines) continue
        const classId = classIds[i]
        for (const d of c.disciplines) {
          if (!disciplineMap.has(d.id)) disciplineMap.set(d.id, [])
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
          options.push({ discipline: d, schoolClassIds: disciplineMap.get(d.id) ?? [] })
        }
      }
      setDisciplineOptions(options)
      if (options.length === 1 && options[0].schoolClassIds.length > 0) {
        setDisciplineId(options[0].discipline.id)
        const classNames = await Promise.all(options[0].schoolClassIds.map((id) => getClassById(id).then((cc) => ({ id: cc.id, name: cc.name }))))
        setSchoolClassOptions(classNames)
        if (classNames.length === 1) setSchoolClassId(classNames[0].id)
      }
    } catch (err) {
      setOptionsError(err instanceof ApiError ? err.message : 'Erro ao carregar opções.')
    } finally {
      setIsLoadingOptions(false)
    }
  }, [teacherId])

  useEffect(() => { if (isTeacher) fetchOptions() }, [isTeacher, fetchOptions])

  useEffect(() => {
    if (disciplineId === '') { setSchoolClassOptions([]); setSchoolClassId(''); return }
    const opt = disciplineOptions.find((o) => o.discipline.id === disciplineId)
    if (!opt) return
    ;(async () => {
      const classes: { id: number; name: string }[] = []
      for (const id of opt.schoolClassIds) {
        try { const c = await getClassById(id); classes.push({ id: c.id, name: c.name }) } catch { void 0 }
      }
      setSchoolClassOptions(classes)
      setSchoolClassId(classes.length === 1 ? classes[0].id : '')
    })()
  }, [disciplineId, disciplineOptions])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!disciplineId || !schoolClassId || !date || !isTimeValid || !isDateValid) return
    const dateIso = dateBrToIso(date)
    if (!dateIso) return
    setSubmitError(null); setIsSubmitting(true)
    try {
      const existingAulas = await searchAulas({ date: dateIso, schoolClassId: Number(schoolClassId) })
      if ((existingAulas ?? []).some((a) => timesOverlap(startTime, endTime, a.startTime ?? '', a.endTime ?? ''))) {
        setSubmitError('Já existe uma aula cadastrada nesta turma no mesmo dia com horário sobreposto.')
        setIsSubmitting(false); return
      }
      await createAula({ date: dateIso, disciplineId: Number(disciplineId), classId: Number(schoolClassId), startTime, endTime })
      navigate('/aulas')
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : err instanceof Error ? err.message : 'Erro ao criar aula.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const HoursSelect = ({ value, onChange, disabled }: { value: number; onChange: (v: number) => void; disabled: boolean }) => (
    <select value={value} onChange={(e) => onChange(parseInt(e.target.value, 10))} className={`${selectCls} w-20`} disabled={disabled}>
      {Array.from({ length: 24 }, (_, i) => <option key={i} value={i}>{String(i).padStart(2, '0')}h</option>)}
    </select>
  )
  const MinsSelect = ({ value, onChange, disabled }: { value: number; onChange: (v: number) => void; disabled: boolean }) => (
    <select value={value} onChange={(e) => onChange(parseInt(e.target.value, 10))} className={`${selectCls} w-20`} disabled={disabled}>
      {Array.from({ length: 60 }, (_, i) => <option key={i} value={i}>{String(i).padStart(2, '0')}</option>)}
    </select>
  )

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <PageHeader title="Nova Aula" back={<BackButton to="/aulas" />} />

      <div className="flex-1 p-6">
        {user?.role !== 'TEACHER' ? (
          <p className="text-sm text-[var(--color-text-muted)]">Apenas professores podem criar aulas.</p>
        ) : (
          <StateBlock loading={isLoadingOptions} loadingText="Carregando opções..." error={optionsError || (disciplineOptions.length === 0 ? 'Você não possui disciplinas ou turmas vinculadas.' : null)} onRetry={fetchOptions}>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-md">
              {submitError && <Alert type="error">{submitError}</Alert>}

              <FormField label="Data" required>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={date}
                    onChange={(e) => { setDate(formatDateInput(e.target.value)); if (isToday) setIsToday(false) }}
                    className={`${inputCls} flex-1`}
                    placeholder="dd/mm/aaaa"
                    maxLength={10}
                    required
                    disabled={isSubmitting}
                  />
                  <label className="flex items-center gap-2 text-sm text-[var(--color-text-primary)] cursor-pointer whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={isToday}
                      onChange={(e) => { setIsToday(e.target.checked); setDate(e.target.checked ? getTodayBr() : '') }}
                      disabled={isSubmitting}
                      className="accent-[var(--color-primary)] w-4 h-4"
                    />
                    Hoje
                  </label>
                </div>
              </FormField>

              <FormField label="Disciplina" required>
                <Select
                  value={disciplineId}
                  onChange={(e) => setDisciplineId(e.target.value ? parseInt(e.target.value, 10) : '')}
                  required
                  disabled={isSubmitting || disciplineOptions.length === 1}
                >
                  <option value="">Selecione a disciplina</option>
                  {disciplineOptions.map((o) => <option key={o.discipline.id} value={o.discipline.id}>{o.discipline.name}</option>)}
                </Select>
              </FormField>

              <FormField label="Turma" required>
                <Select
                  value={schoolClassId}
                  onChange={(e) => setSchoolClassId(e.target.value ? parseInt(e.target.value, 10) : '')}
                  required
                  disabled={isSubmitting || schoolClassOptions.length === 0 || schoolClassOptions.length === 1}
                >
                  <option value="">Selecione a turma</option>
                  {schoolClassOptions.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Select>
              </FormField>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Horário início" required>
                  <div className="flex items-center gap-1">
                    <HoursSelect value={startHour} onChange={setStartHour} disabled={isSubmitting} />
                    <span className="text-[var(--color-text-muted)] text-sm">:</span>
                    <MinsSelect value={startMinute} onChange={setStartMinute} disabled={isSubmitting} />
                  </div>
                </FormField>
                <FormField label="Horário fim" required>
                  <div className="flex items-center gap-1">
                    <HoursSelect value={endHour} onChange={setEndHour} disabled={isSubmitting} />
                    <span className="text-[var(--color-text-muted)] text-sm">:</span>
                    <MinsSelect value={endMinute} onChange={setEndMinute} disabled={isSubmitting} />
                  </div>
                </FormField>
              </div>
              {timeError && <Alert type="error">{timeError}</Alert>}

              <div className="flex gap-3 justify-end">
                <Button variant="secondary" type="button" onClick={() => navigate('/aulas')} disabled={isSubmitting}>Cancelar</Button>
                <Button type="submit" loading={isSubmitting} disabled={!isTimeValid || !isDateValid}>Criar Aula</Button>
              </div>
            </form>
          </StateBlock>
        )}
      </div>
    </div>
  )
}
