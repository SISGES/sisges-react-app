import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FiEdit2, FiInfo, FiPlus, FiTrash2 } from 'react-icons/fi'
import { BackButton } from '../../components/BackButton/BackButton'
import { getAulaById, deleteAula, submitAulaFrequency } from '../../services/userService'
import { getActivitiesByMeeting, createActivity, deleteActivity } from '../../services/activityService'
import { uploadFile } from '../../services/uploadService'
import type { EvaluativeActivity } from '../../services/activityService'
import { ApiError } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import type { AulaDetailResponse } from '../../types/auth'
import { PageHeader, Button, ConfirmModal, Modal, StateBlock, FormField, Input, Textarea, Alert } from '../../components/ui'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'
const UPLOAD_BASE = API_BASE.replace('/api', '')
const getFileUrl = (path: string | null) => path ? (path.startsWith('http') ? path : `${UPLOAD_BASE}${path}`) : null

export function AulaDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const aulaId = id ? parseInt(id, 10) : null

  const [aula, setAula] = useState<AulaDetailResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [attendance, setAttendance] = useState<Record<number, 'P' | 'F'>>({})
  const [isSubmittingFreq, setIsSubmittingFreq] = useState<number | null>(null)
  const [activities, setActivities] = useState<EvaluativeActivity[]>([])
  const [showActivityModal, setShowActivityModal] = useState(false)
  const [activityTitle, setActivityTitle] = useState('')
  const [activityDesc, setActivityDesc] = useState('')
  const [activityFile, setActivityFile] = useState<File | null>(null)
  const [isSubmittingActivity, setIsSubmittingActivity] = useState(false)
  const [activityError, setActivityError] = useState<string | null>(null)

  const isAdmin = user?.role === 'ADMIN'
  const canEdit = user?.role === 'TEACHER' || user?.role === 'ADMIN'

  const fetchActivities = useCallback(async () => {
    if (!aulaId) return
    try { setActivities(await getActivitiesByMeeting(aulaId)) }
    catch { setActivities([]) }
  }, [aulaId])

  useEffect(() => {
    if (!aulaId || isNaN(aulaId)) return
    let cancelled = false
    async function fetchAula() {
      setIsLoading(true); setError(null)
      try {
        const data = await getAulaById(aulaId!)
        if (!cancelled) {
          setAula(data); fetchActivities()
          const initial: Record<number, 'P' | 'F'> = {}
          ;(data.students ?? []).forEach((s) => { initial[s.id] = s.present === false ? 'F' : 'P' })
          setAttendance(initial)
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : err instanceof Error ? err.message : 'Erro ao carregar detalhes da aula.')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    fetchAula()
    return () => { cancelled = true }
  }, [aulaId, fetchActivities])

  const handleDelete = async () => {
    if (!aulaId || !isAdmin) return
    setIsDeleting(true)
    try { await deleteAula(aulaId); setDeleteConfirm(false); navigate('/aulas') }
    catch (err) { alert(err instanceof Error ? err.message : 'Erro ao excluir aula.') }
    finally { setIsDeleting(false) }
  }

  const handleToggleAttendance = async (studentId: number, newStatus: 'P' | 'F') => {
    if (!aulaId || !aula) return
    setIsSubmittingFreq(studentId)
    const prevStatus = attendance[studentId] ?? 'P'
    setAttendance((prev) => ({ ...prev, [studentId]: newStatus }))
    try { await submitAulaFrequency(aulaId, { entries: [{ studentId, status: newStatus }] }) }
    catch (err) { setAttendance((prev) => ({ ...prev, [studentId]: prevStatus })); alert(err instanceof ApiError ? err.message : 'Erro ao atualizar frequência.') }
    finally { setIsSubmittingFreq(null) }
  }

  const handleSubmitActivity = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!aulaId || !activityTitle.trim()) return
    setIsSubmittingActivity(true); setActivityError(null)
    try {
      let filePath: string | undefined
      if (activityFile) { const { path } = await uploadFile(activityFile, 'activities'); filePath = path }
      await createActivity({ classMeetingId: aulaId, title: activityTitle.trim(), description: activityDesc.trim() || undefined, filePath })
      setActivityTitle(''); setActivityDesc(''); setActivityFile(null); setShowActivityModal(false)
      fetchActivities()
    } catch (err) { setActivityError(err instanceof Error ? err.message : 'Erro ao criar atividade.') }
    finally { setIsSubmittingActivity(false) }
  }

  const handleDeleteActivity = async (id: number) => {
    if (!window.confirm('Excluir esta atividade?')) return
    try { await deleteActivity(id); fetchActivities() }
    catch (err) { alert(err instanceof Error ? err.message : 'Erro ao excluir.') }
  }

  if (!aulaId || isNaN(aulaId)) {
    return <div className="flex-1 flex items-center justify-center"><p className="text-sm text-[var(--color-error)]">ID inválido.</p></div>
  }

  const headerActions = aula ? (
    <div className="flex items-center gap-2">
      {canEdit && (
        <button type="button" onClick={() => navigate(`/aulas/${aulaId}/edit`)} title="Editar" className="flex items-center justify-center w-8 h-8 rounded-md border border-[var(--color-border)] bg-transparent text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] cursor-pointer transition-colors">
          <FiEdit2 size={15} />
        </button>
      )}
      {isAdmin && (
        <button type="button" onClick={() => setDeleteConfirm(true)} title="Excluir" disabled={isDeleting} className="flex items-center justify-center w-8 h-8 rounded-md border border-[var(--color-border)] bg-transparent text-[var(--color-text-muted)] hover:text-[var(--color-error)] hover:border-[var(--color-error)] cursor-pointer transition-colors disabled:opacity-50">
          <FiTrash2 size={15} />
        </button>
      )}
    </div>
  ) : undefined

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <PageHeader title="Detalhes da Aula" back={<BackButton to="/aulas" />} action={headerActions} />

      <div className="flex-1 p-6">
        <StateBlock loading={isLoading} loadingText="Carregando..." error={error} empty={!aula} emptyText="Aula não encontrada.">
          {aula && (
            <div className="flex flex-col gap-6 max-w-2xl">
              {/* Info */}
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-5">
                <h2 className="text-base font-semibold text-[var(--color-text-primary)]">{aula.name}</h2>
                {aula.academicYear && <p className="text-sm text-[var(--color-text-muted)] mt-1">{aula.academicYear}</p>}

                <div className="mt-4 border-t border-[var(--color-border)] pt-4 flex items-center justify-between gap-3">
                  <span className="text-sm text-[var(--color-text-primary)]">{aula.professor.name}</span>
                  {isAdmin && (
                    <button type="button" onClick={() => navigate(`/users/${aula.professor.id}`)} title="Ver detalhes do professor" className="flex items-center justify-center w-7 h-7 rounded-md border border-[var(--color-border)] bg-transparent text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] cursor-pointer transition-colors">
                      <FiInfo size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Activities */}
              {canEdit && (
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
                    <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Atividades Avaliativas</h3>
                    <Button size="sm" icon={<FiPlus size={13} />} onClick={() => { setActivityTitle(''); setActivityDesc(''); setActivityFile(null); setActivityError(null); setShowActivityModal(true) }}>
                      Nova atividade
                    </Button>
                  </div>
                  <div className="p-5">
                    {activities.length === 0 ? (
                      <p className="text-sm text-[var(--color-text-muted)]">Nenhuma atividade cadastrada.</p>
                    ) : (
                      <ul className="flex flex-col gap-3">
                        {activities.map((a) => (
                          <li key={a.id} className="flex items-start justify-between gap-4 py-2 border-b border-[var(--color-border)] last:border-0">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-sm font-medium text-[var(--color-text-primary)]">{a.title}</span>
                              {a.description && <span className="text-xs text-[var(--color-text-muted)]">{a.description}</span>}
                              {a.filePath && <a href={getFileUrl(a.filePath) ?? '#'} target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--color-primary)] hover:underline">Baixar documento</a>}
                            </div>
                            <button type="button" onClick={() => handleDeleteActivity(a.id)} title="Excluir" className="flex items-center justify-center w-7 h-7 rounded-md border border-[var(--color-border)] bg-transparent text-[var(--color-text-muted)] hover:text-[var(--color-error)] hover:border-[var(--color-error)] cursor-pointer transition-colors flex-shrink-0">
                              <FiTrash2 size={14} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}

              {/* Students / Attendance */}
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg overflow-hidden">
                <div className="px-5 py-4 border-b border-[var(--color-border)]">
                  <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Alunos</h3>
                </div>
                <ul className="divide-y divide-[var(--color-border)]">
                  {(aula.students ?? []).map((s) => {
                    const currentStatus = attendance[s.id] ?? 'P'
                    const isPresent = currentStatus === 'P'
                    const isUpdating = isSubmittingFreq === s.id
                    return (
                      <li key={s.id} className="flex items-center gap-4 px-5 py-3">
                        {canEdit && (
                          <button
                            type="button"
                            onClick={() => handleToggleAttendance(s.id, isPresent ? 'F' : 'P')}
                            disabled={isUpdating}
                            title={isPresent ? 'Marcar falta' : 'Marcar presença'}
                            className={[
                              'flex-shrink-0 w-11 h-6 rounded-full border-2 transition-colors duration-200 relative cursor-pointer disabled:opacity-50',
                              isPresent ? 'bg-[var(--color-success)] border-[var(--color-success)]' : 'bg-[var(--color-background)] border-[var(--color-border)]',
                            ].join(' ')}
                          >
                            <span className={[
                              'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200',
                              isPresent ? 'left-5' : 'left-0.5',
                            ].join(' ')} />
                          </button>
                        )}
                        <span className={[
                          'text-xs font-semibold w-16 flex-shrink-0',
                          isPresent ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]',
                        ].join(' ')}>
                          {isPresent ? 'PRESENTE' : 'FALTOU'}
                        </span>
                        <span className="text-sm text-[var(--color-text-primary)] flex-1">{s.name}</span>
                        {isAdmin && (
                          <button type="button" onClick={() => navigate(`/users/${s.id}`)} title="Ver detalhes" className="flex items-center justify-center w-7 h-7 rounded-md border border-[var(--color-border)] bg-transparent text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] cursor-pointer transition-colors flex-shrink-0">
                            <FiInfo size={14} />
                          </button>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>
          )}
        </StateBlock>
      </div>

      <ConfirmModal
        open={deleteConfirm}
        onClose={() => !isDeleting && setDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Excluir aula"
        message="Tem certeza que deseja excluir esta aula? Esta ação não pode ser desfeita."
        confirmLabel={isDeleting ? 'Excluindo...' : 'Excluir'}
        loading={isDeleting}
      />

      <Modal
        open={showActivityModal}
        onClose={() => !isSubmittingActivity && setShowActivityModal(false)}
        title="Nova Atividade Avaliativa"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowActivityModal(false)} disabled={isSubmittingActivity}>Cancelar</Button>
            <Button type="submit" form="activity-form" loading={isSubmittingActivity}>Criar</Button>
          </>
        }
      >
        <form id="activity-form" onSubmit={handleSubmitActivity} className="flex flex-col gap-4">
          {activityError && <Alert type="error">{activityError}</Alert>}
          <FormField label="Título" required>
            <Input value={activityTitle} onChange={(e) => setActivityTitle(e.target.value)} required maxLength={255} disabled={isSubmittingActivity} />
          </FormField>
          <FormField label="Descrição">
            <Textarea value={activityDesc} onChange={(e) => setActivityDesc(e.target.value)} rows={3} disabled={isSubmittingActivity} />
          </FormField>
          <FormField label="Documento (PDF, TXT, DOCX)">
            <input type="file" accept=".pdf,.txt,.docx,.doc" onChange={(e) => setActivityFile(e.target.files?.[0] ?? null)} disabled={isSubmittingActivity}
              className="text-sm text-[var(--color-text-primary)] file:mr-3 file:px-3 file:py-1.5 file:text-xs file:font-medium file:rounded-md file:border file:border-[var(--color-border)] file:bg-[var(--color-background)] file:text-[var(--color-text-primary)] file:cursor-pointer hover:file:bg-[var(--color-surface)] file:transition-colors"
            />
          </FormField>
        </form>
      </Modal>
    </div>
  )
}
