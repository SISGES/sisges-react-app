import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { FiPlus, FiUserMinus } from 'react-icons/fi'
import { BackButton } from '../../components/BackButton/BackButton'
import {
  getClassById, searchStudents, searchTeachers, getDisciplines,
  addStudentToClass, addTeacherToClass, addDisciplineToClass,
  removeStudentFromClass, removeTeacherFromClass, removeDisciplineFromClass,
  createDiscipline,
} from '../../services/userService'
import { ApiError } from '../../services/api'
import type {
  ClassDetailResponse, UserSimple, StudentSearchResponse, TeacherSearchResponse,
  DisciplineResponse, DisciplineSimple,
} from '../../types/auth'
import { PageHeader, Button, Modal, ConfirmModal, StateBlock, FormField, Input, Textarea } from '../../components/ui'

const selectCls = 'flex-1 px-3 py-2 text-sm bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors'

export function EditClass() {
  const { id } = useParams<{ id: string }>()
  const classId = id ? parseInt(id, 10) : null

  const [schoolClass, setSchoolClass] = useState<ClassDetailResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [allStudents, setAllStudents] = useState<StudentSearchResponse[]>([])
  const [allTeachers, setAllTeachers] = useState<TeacherSearchResponse[]>([])
  const [allDisciplines, setAllDisciplines] = useState<DisciplineResponse[]>([])
  const [selectedStudentId, setSelectedStudentId] = useState<string>('')
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('')
  const [selectedDisciplineId, setSelectedDisciplineId] = useState<string>('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const [confirmModal, setConfirmModal] = useState<
    | { type: 'student' | 'teacher'; person: UserSimple }
    | { type: 'discipline'; discipline: DisciplineSimple }
    | null
  >(null)

  const [showCreateDisciplineModal, setShowCreateDisciplineModal] = useState(false)
  const [newDisciplineName, setNewDisciplineName] = useState('')
  const [newDisciplineDescription, setNewDisciplineDescription] = useState('')

  const fetchClass = useCallback(async () => {
    if (!classId || isNaN(classId)) return
    setIsLoading(true); setError(null)
    try { setSchoolClass(await getClassById(classId)) }
    catch (err) { setError(err instanceof ApiError ? err.message : err instanceof Error ? err.message : 'Erro ao carregar turma.') }
    finally { setIsLoading(false) }
  }, [classId])

  const fetchLists = useCallback(async () => {
    try {
      const [students, teachers, disciplines] = await Promise.all([searchStudents(), searchTeachers(), getDisciplines()])
      setAllStudents(students); setAllTeachers(teachers); setAllDisciplines(disciplines)
    } catch { void 0 }
  }, [])

  useEffect(() => { fetchClass(); fetchLists() }, [fetchClass, fetchLists])

  const handleConfirmUnlink = async () => {
    if (!classId || !confirmModal) return
    if (confirmModal.type === 'discipline') {
      const { discipline } = confirmModal
      setActionLoading(`remove-discipline-${discipline.id}`); setConfirmModal(null)
      try { setSchoolClass(await removeDisciplineFromClass(classId, discipline.id)) }
      catch (err) { alert(err instanceof Error ? err.message : 'Erro') }
      finally { setActionLoading(null) }
      return
    }
    const { type, person } = confirmModal
    setActionLoading(type === 'student' ? `remove-student-${person.id}` : `remove-teacher-${person.id}`)
    setConfirmModal(null)
    try {
      setSchoolClass(await (type === 'student' ? removeStudentFromClass(classId, person.id) : removeTeacherFromClass(classId, person.id)))
    } catch (err) { alert(err instanceof Error ? err.message : 'Erro') }
    finally { setActionLoading(null) }
  }

  const handleAdd = async (action: () => Promise<ClassDetailResponse>, key: string) => {
    setActionLoading(key)
    try { setSchoolClass(await action()) }
    catch (err) { alert(err instanceof Error ? err.message : 'Erro') }
    finally { setActionLoading(null) }
  }

  const handleCreateDiscipline = async () => {
    if (!newDisciplineName.trim() || !classId) return
    setActionLoading('create-discipline')
    try {
      const created = await createDiscipline({ name: newDisciplineName.trim(), description: newDisciplineDescription.trim() || undefined })
      setAllDisciplines((prev) => [...prev, created])
      setNewDisciplineName(''); setNewDisciplineDescription('')
      setShowCreateDisciplineModal(false)
      setSchoolClass(await addDisciplineToClass(classId, created.id))
    } catch (err) { alert(err instanceof Error ? err.message : 'Erro') }
    finally { setActionLoading(null) }
  }

  const disciplinesInClass = schoolClass?.disciplines ?? []
  const disciplineIdsInClass = new Set(disciplinesInClass.map((d) => d.id))
  const studentIdsInClass = new Set(schoolClass?.students.map((s) => s.id) ?? [])
  const teacherIdsInClass = new Set(schoolClass?.teachers.map((t) => t.id) ?? [])
  const availableStudents = allStudents.filter((s) => !studentIdsInClass.has(s.id))
  const availableTeachers = allTeachers.filter((t) => !teacherIdsInClass.has(t.id))
  const availableDisciplines = allDisciplines.filter((d) => !disciplineIdsInClass.has(d.id))

  if (!classId || isNaN(classId)) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center p-6">
        <p className="text-sm text-[var(--color-error)]">ID da turma inválido.</p>
      </div>
    )
  }

  const confirmMsg = confirmModal
    ? confirmModal.type === 'discipline'
      ? <span>Remover a disciplina <strong>{confirmModal.discipline.name}</strong> da turma?</span>
      : <span>Desvincular {confirmModal.type === 'student' ? 'o aluno' : 'o professor'} <strong>{confirmModal.person.name}</strong> da turma?</span>
    : null

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <PageHeader
        title="Editar Turma"
        subtitle={schoolClass ? `${schoolClass.name} · ${schoolClass.academicYear}` : undefined}
        back={<BackButton to="/admin/classes" />}
      />

      <div className="flex-1 p-6">
        <StateBlock loading={isLoading} loadingText="Carregando..." error={error} onRetry={fetchClass}>
          {schoolClass && (
            <div className="flex flex-col gap-6">
              {/* Alunos */}
              <SectionPanel
                title={`Alunos (${schoolClass.students.length})`}
                items={schoolClass.students}
                onRemove={(s) => setConfirmModal({ type: 'student', person: s })}
                actionLoading={actionLoading}
                removeKey={(s) => `remove-student-${s.id}`}
                renderItem={(s) => <span>{s.name} <span className="text-[var(--color-text-muted)] text-xs">({s.email})</span></span>}
                emptyText="Nenhum aluno vinculado."
              >
                <AddRow
                  label="Vincular novo aluno"
                  value={selectedStudentId}
                  onChange={setSelectedStudentId}
                  disabled={!!actionLoading}
                  placeholder="Selecione um aluno"
                  options={availableStudents.map((s) => ({ value: String(s.id), label: `${s.name} (${s.email})` }))}
                  onAdd={() => {
                    const studentId = parseInt(selectedStudentId, 10)
                    if (!isNaN(studentId)) handleAdd(() => addStudentToClass(classId, studentId).then((r) => { setSelectedStudentId(''); return r }), 'add-student')
                  }}
                  addLoading={actionLoading === 'add-student'}
                />
              </SectionPanel>

              {/* Professores */}
              <SectionPanel
                title={`Professores (${schoolClass.teachers.length})`}
                items={schoolClass.teachers}
                onRemove={(t) => setConfirmModal({ type: 'teacher', person: t })}
                actionLoading={actionLoading}
                removeKey={(t) => `remove-teacher-${t.id}`}
                renderItem={(t) => <span>{t.name} <span className="text-[var(--color-text-muted)] text-xs">({t.email})</span></span>}
                emptyText="Nenhum professor vinculado."
              >
                <AddRow
                  label="Vincular novo professor"
                  value={selectedTeacherId}
                  onChange={setSelectedTeacherId}
                  disabled={!!actionLoading}
                  placeholder="Selecione um professor"
                  options={availableTeachers.map((t) => ({ value: String(t.id), label: `${t.name} (${t.email})` }))}
                  onAdd={() => {
                    const teacherId = parseInt(selectedTeacherId, 10)
                    if (!isNaN(teacherId)) handleAdd(() => addTeacherToClass(classId, teacherId).then((r) => { setSelectedTeacherId(''); return r }), 'add-teacher')
                  }}
                  addLoading={actionLoading === 'add-teacher'}
                />
              </SectionPanel>

              {/* Disciplinas */}
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
                  <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                    Disciplinas ({disciplinesInClass.length})
                  </h3>
                  <Button size="sm" icon={<FiPlus size={13} />} onClick={() => setShowCreateDisciplineModal(true)} disabled={!!actionLoading}>
                    Nova disciplina
                  </Button>
                </div>
                <div className="p-5 flex flex-col gap-4">
                  {disciplinesInClass.length === 0 ? (
                    <p className="text-sm text-[var(--color-text-muted)]">Nenhuma disciplina vinculada.</p>
                  ) : (
                    <ul className="flex flex-col divide-y divide-[var(--color-border)]">
                      {disciplinesInClass.map((d) => (
                        <li key={d.id} className="flex items-center justify-between gap-3 py-2.5">
                          <span className="text-sm text-[var(--color-text-primary)]">{d.name}</span>
                          <UnlinkBtn
                            onClick={() => setConfirmModal({ type: 'discipline', discipline: d })}
                            loading={actionLoading === `remove-discipline-${d.id}`}
                            disabled={!!actionLoading}
                          />
                        </li>
                      ))}
                    </ul>
                  )}
                  <AddRow
                    label="Vincular disciplina existente"
                    value={selectedDisciplineId}
                    onChange={setSelectedDisciplineId}
                    disabled={!!actionLoading}
                    placeholder="Selecione uma disciplina"
                    options={availableDisciplines.map((d) => ({ value: String(d.id), label: d.name }))}
                    onAdd={() => {
                      const disciplineId = parseInt(selectedDisciplineId, 10)
                      if (!isNaN(disciplineId)) handleAdd(() => addDisciplineToClass(classId, disciplineId).then((r) => { setSelectedDisciplineId(''); return r }), 'add-discipline')
                    }}
                    addLoading={actionLoading === 'add-discipline'}
                  />
                </div>
              </div>
            </div>
          )}
        </StateBlock>
      </div>

      {/* Confirm unlink */}
      <ConfirmModal
        open={!!confirmModal}
        onClose={() => setConfirmModal(null)}
        onConfirm={handleConfirmUnlink}
        title="Confirmar desvinculação"
        message={confirmMsg ?? ''}
        confirmLabel={confirmModal?.type === 'discipline' ? 'Remover' : 'Desvincular'}
      />

      {/* Create discipline modal */}
      <Modal
        open={showCreateDisciplineModal}
        onClose={() => setShowCreateDisciplineModal(false)}
        title="Nova Disciplina"
        maxWidth="max-w-md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowCreateDisciplineModal(false)} disabled={!!actionLoading}>Cancelar</Button>
            <Button
              onClick={handleCreateDiscipline}
              disabled={!newDisciplineName.trim() || !!actionLoading}
              loading={actionLoading === 'create-discipline'}
            >
              Criar e vincular
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <FormField label="Nome" required>
            <Input
              value={newDisciplineName}
              onChange={(e) => setNewDisciplineName(e.target.value)}
              placeholder="Ex: Matemática"
              maxLength={150}
              disabled={!!actionLoading}
            />
          </FormField>
          <FormField label="Descrição">
            <Textarea
              value={newDisciplineDescription}
              onChange={(e) => setNewDisciplineDescription(e.target.value)}
              placeholder="Descrição opcional"
              maxLength={5000}
              rows={3}
              disabled={!!actionLoading}
            />
          </FormField>
        </div>
      </Modal>
    </div>
  )
}

function SectionPanel<T extends { id: number }>({
  title, items, onRemove, actionLoading, removeKey, renderItem, emptyText, children,
}: {
  title: string
  items: T[]
  onRemove: (item: T) => void
  actionLoading: string | null
  removeKey: (item: T) => string
  renderItem: (item: T) => React.ReactNode
  emptyText: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg overflow-hidden">
      <div className="px-5 py-4 border-b border-[var(--color-border)]">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">{title}</h3>
      </div>
      <div className="p-5 flex flex-col gap-4">
        {items.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)]">{emptyText}</p>
        ) : (
          <ul className="flex flex-col divide-y divide-[var(--color-border)]">
            {items.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="text-sm text-[var(--color-text-primary)] flex-1 min-w-0">{renderItem(item)}</div>
                <UnlinkBtn
                  onClick={() => onRemove(item)}
                  loading={actionLoading === removeKey(item)}
                  disabled={!!actionLoading}
                />
              </li>
            ))}
          </ul>
        )}
        {children}
      </div>
    </div>
  )
}

function UnlinkBtn({ onClick, loading, disabled }: { onClick: () => void; loading: boolean; disabled: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title="Desvincular"
      className="flex items-center justify-center w-7 h-7 rounded-md border border-[var(--color-border)] bg-transparent text-[var(--color-text-muted)] hover:text-[var(--color-error)] hover:border-[var(--color-error)] cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
    >
      {loading ? (
        <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" style={{ animation: 'spin 0.8s linear infinite' }} />
      ) : (
        <FiUserMinus size={14} />
      )}
    </button>
  )
}

function AddRow({
  label, value, onChange, disabled, placeholder, options, onAdd, addLoading,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  disabled: boolean
  placeholder: string
  options: { value: string; label: string }[]
  onAdd: () => void
  addLoading: boolean
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-[var(--color-text-muted)]">{label}</label>
      <div className="flex items-center gap-2">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={selectCls}
        >
          <option value="">{placeholder}</option>
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <button
          type="button"
          onClick={onAdd}
          disabled={!value || disabled}
          title="Vincular"
          className="flex items-center justify-center w-8 h-8 rounded-md border border-[var(--color-border)] bg-transparent text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
        >
          {addLoading ? (
            <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full" style={{ animation: 'spin 0.8s linear infinite' }} />
          ) : (
            <FiPlus size={15} />
          )}
        </button>
      </div>
    </div>
  )
}
