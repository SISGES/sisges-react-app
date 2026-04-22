import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { BackButton } from '../../components/BackButton/BackButton'
import {
  getAulaById, updateAula, submitAulaFrequency,
  getTeacherById, getClassById, getDisciplines, searchClasses, searchAulas,
} from '../../services/userService'
import { ApiError } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import type { AulaDetailResponse, DisciplineSimple } from '../../types/auth'
import { PageHeader, Button, Modal, StateBlock, FormField, Select, Input, Alert } from '../../components/ui'

function timeToMins(t: string): number {
  const parts = t.split(':')
  return parseInt(parts[0] || '0', 10) * 60 + parseInt(parts[1] || '0', 10)
}
function timesOverlap(s1: string, e1: string, s2: string, e2: string): boolean {
  return timeToMins(s1) < timeToMins(e2) && timeToMins(s2) < timeToMins(e1)
}

const inputCls = 'w-full px-3 py-2 text-sm bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] disabled:opacity-50 transition-colors'

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
    setIsLoading(true); setError(null)
    try {
      const data = await getAulaById(aulaId)
      setAula(data)
      if (data.date) setDate(data.date)
      if (data.startTime) setStartTime(data.startTime)
      if (data.endTime) setEndTime(data.endTime)
      if (data.disciplineId != null) setDisciplineId(data.disciplineId)
      if (data.schoolClassId != null) setSchoolClassId(data.schoolClassId)
      const initial: Record<string, 'P' | 'F'> = {}
      ;(data.students ?? []).forEach((s) => { initial[s.name] = 'P' })
      setAttendance(initial)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao carregar aula.')
    } finally {
      setIsLoading(false)
    }
  }, [aulaId])

  const fetchOptions = useCallback(async () => {
    try {
      if (isAdmin) {
        const [discData, classesData] = await Promise.all([getDisciplines(), searchClasses()])
        setDisciplines(discData.map((d) => ({ id: d.id, name: d.name })))
        setSchoolClasses(classesData.map((c) => ({ id: c.id, name: c.name })))
      } else if (user?.id) {
        const teacher = await getTeacherById(user.id)
        const classIds = teacher.classes?.map((c) => c.id) ?? []
        const classDetails = await Promise.all(classIds.map((cid) => getClassById(cid).catch(() => null)))
        const discSet = new Set<number>()
        for (const c of classDetails) {
          if (!c?.disciplines) continue
          for (const d of c.disciplines) discSet.add(d.id)
        }
        const discList = Array.from(discSet).map((did) => {
          const d = classDetails.flatMap((c) => c?.disciplines ?? []).find((dd) => dd.id === did)
          return d ?? { id: did, name: '' }
        })
        setDisciplines(discList.filter((d) => d.name))
      }
    } catch { void 0 }
  }, [isAdmin, user?.id])

  useEffect(() => { fetchAula() }, [fetchAula])
  useEffect(() => { fetchOptions() }, [fetchOptions])

  useEffect(() => {
    if (disciplineId === '' || isAdmin) return
    ;(async () => {
      try {
        const teacher = await getTeacherById(user!.id)
        const classIds = teacher.classes?.map((c) => c.id) ?? []
        const classDetails = await Promise.all(classIds.map((cid) => getClassById(cid).catch(() => null)))
        const validClassIds: number[] = []
        for (let i = 0; i < classDetails.length; i++) {
          const c = classDetails[i]
          if (c?.disciplines?.some((d) => d.id === disciplineId)) validClassIds.push(classIds[i])
        }
        const classes = await Promise.all(validClassIds.map((cid) => getClassById(cid).then((cc) => ({ id: cc.id, name: cc.name }))))
        setSchoolClasses(classes)
        setSchoolClassId((prev) => {
          const validIds = classes.map((c) => c.id)
          return validIds.includes(prev as number) ? prev : (classes[0]?.id ?? '')
        })
      } catch { setSchoolClasses([]) }
    })()
  }, [disciplineId, isAdmin, user?.id])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!aulaId || !disciplineId || !schoolClassId || !date || !startTime || !endTime) return
    if (timeToMins(endTime) <= timeToMins(startTime)) { setSubmitError('O horário de fim deve ser maior que o de início.'); return }
    setSubmitError(null); setIsSubmitting(true)
    try {
      const existing = await searchAulas({ date, schoolClassId: Number(schoolClassId) })
      if ((existing ?? []).filter((a) => a.id !== aulaId).some((a) => timesOverlap(startTime, endTime, a.startTime ?? '', a.endTime ?? ''))) {
        setSubmitError('Já existe uma aula nesta turma no mesmo dia com horário sobreposto.')
        setIsSubmitting(false); return
      }
      await updateAula(aulaId, { date, disciplineId: Number(disciplineId), classId: Number(schoolClassId), startTime, endTime })
      navigate(`/aulas/${aulaId}`)
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : 'Erro ao atualizar aula.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitFrequency = async () => {
    if (!aulaId || !aula) return
    setIsSubmittingFreq(true); setFreqError(null)
    try {
      await submitAulaFrequency(aulaId, { entries: (aula.students ?? []).map((s) => ({ studentId: s.id, status: (attendance[s.name] ?? 'P') as 'P' | 'F' })) })
      setShowFrequencyModal(false)
    } catch (err) {
      setFreqError(err instanceof ApiError ? err.message : 'Erro ao lançar frequência.')
    } finally {
      setIsSubmittingFreq(false)
    }
  }

  if (!aulaId || isNaN(aulaId)) {
    return <div className="flex-1 flex items-center justify-center"><p className="text-sm text-[var(--color-error)]">ID inválido.</p></div>
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <PageHeader
        title="Editar Aula"
        back={<BackButton to={`/aulas/${aulaId}`} />}
        action={aula ? <Button size="sm" variant="secondary" onClick={() => setShowFrequencyModal(true)}>Lançar Frequência</Button> : undefined}
      />

      <div className="flex-1 p-6">
        <StateBlock loading={isLoading} loadingText="Carregando..." error={error} onRetry={fetchAula}>
          {aula && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-md">
              {submitError && <Alert type="error">{submitError}</Alert>}

              <FormField label="Data" required>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required disabled={isSubmitting} />
              </FormField>

              <FormField label="Disciplina" required>
                <Select value={disciplineId} onChange={(e) => setDisciplineId(e.target.value ? parseInt(e.target.value, 10) : '')} required disabled={isSubmitting}>
                  <option value="">Selecione</option>
                  {disciplines.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </Select>
              </FormField>

              <FormField label="Turma" required>
                <Select value={schoolClassId} onChange={(e) => setSchoolClassId(e.target.value ? parseInt(e.target.value, 10) : '')} required disabled={isSubmitting}>
                  <option value="">Selecione</option>
                  {schoolClasses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Select>
              </FormField>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Início" required>
                  <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required disabled={isSubmitting} className={inputCls} />
                </FormField>
                <FormField label="Fim" required>
                  <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required disabled={isSubmitting} className={inputCls} />
                </FormField>
              </div>

              <div className="flex gap-3 justify-end">
                <Button variant="secondary" type="button" onClick={() => navigate(`/aulas/${aulaId}`)} disabled={isSubmitting}>Cancelar</Button>
                <Button type="submit" loading={isSubmitting}>Salvar</Button>
              </div>
            </form>
          )}
        </StateBlock>
      </div>

      {aula && (
        <Modal
          open={showFrequencyModal}
          onClose={() => !isSubmittingFreq && setShowFrequencyModal(false)}
          title="Lançar Frequência"
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowFrequencyModal(false)} disabled={isSubmittingFreq}>Cancelar</Button>
              <Button onClick={handleSubmitFrequency} loading={isSubmittingFreq}>Salvar</Button>
            </>
          }
        >
          <div className="flex flex-col gap-3">
            {freqError && <Alert type="error">{freqError}</Alert>}
            {(aula.students ?? []).map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-4 py-2 border-b border-[var(--color-border)] last:border-0">
                <span className="text-sm text-[var(--color-text-primary)]">{s.name}</span>
                <div className="flex gap-4">
                  {(['P', 'F'] as const).map((status) => (
                    <label key={status} className="flex items-center gap-1.5 text-sm text-[var(--color-text-primary)] cursor-pointer">
                      <input type="radio" name={`freq-${s.id}`} checked={attendance[s.name] === status} onChange={() => setAttendance((p) => ({ ...p, [s.name]: status }))} className="accent-[var(--color-primary)]" />
                      {status === 'P' ? 'Presente' : 'Faltoso'}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  )
}
