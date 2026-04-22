import { useState, useEffect, useCallback } from 'react'
import { FiEdit2, FiPlus } from 'react-icons/fi'
import { BackButton } from '../../components/BackButton/BackButton'
import { getDisciplines, createDiscipline, updateDiscipline, searchTeachers } from '../../services/userService'
import { ApiError } from '../../services/api'
import type { DisciplineResponse, TeacherSearchResponse } from '../../types/auth'
import { PageHeader, Button, Modal, DataCard, StateBlock, tableStyles, FormField, Input, Textarea, Alert } from '../../components/ui'

export function Disciplines() {
  const [disciplines, setDisciplines] = useState<DisciplineResponse[]>([])
  const [teachers, setTeachers] = useState<TeacherSearchResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<DisciplineResponse | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedTeacherIds, setSelectedTeacherIds] = useState<number[]>([])

  const fetchDisciplines = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      setDisciplines(await getDisciplines())
    } catch (err) {
      setError(err instanceof ApiError ? err.message : err instanceof Error ? err.message : 'Erro ao carregar disciplinas.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchTeachers = useCallback(async () => {
    try { setTeachers(await searchTeachers()) } catch { void 0 }
  }, [])

  useEffect(() => { fetchDisciplines(); fetchTeachers() }, [fetchDisciplines, fetchTeachers])

  const resetForm = () => {
    setName(''); setDescription(''); setSelectedTeacherIds([])
    setEditing(null); setSubmitError(null); setSubmitSuccess(null)
  }

  const handleClose = () => { setShowModal(false); resetForm() }

  const handleEdit = (d: DisciplineResponse) => {
    setEditing(d)
    setName(d.name)
    setDescription(d.description || '')
    setSelectedTeacherIds(d.teachers?.map((t) => t.id) ?? [])
    setShowModal(true)
  }

  const toggleTeacher = (id: number) => {
    setSelectedTeacherIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitError(null); setSubmitSuccess(null); setIsSubmitting(true)
    try {
      if (editing) {
        await updateDiscipline(editing.id, {
          name: name.trim(),
          description: description.trim() || undefined,
          teachers: teachers.map((t) => ({ teacherId: t.id, vinculado: selectedTeacherIds.includes(t.id) })),
        })
        setSubmitSuccess('Disciplina atualizada com sucesso!')
      } else {
        await createDiscipline({
          name: name.trim(),
          description: description.trim() || undefined,
          teacherIds: selectedTeacherIds.length > 0 ? selectedTeacherIds : undefined,
        })
        setSubmitSuccess('Disciplina criada com sucesso!')
      }
      resetForm(); fetchDisciplines()
      setTimeout(handleClose, 1200)
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : 'Erro ao salvar disciplina.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <PageHeader
        title="Disciplinas"
        back={<BackButton to="/" />}
        action={
          <Button size="sm" icon={<FiPlus size={14} />} onClick={() => { resetForm(); setShowModal(true) }}>
            Nova disciplina
          </Button>
        }
      />

      <div className="flex-1 p-6">
        <DataCard
          title="Disciplinas Cadastradas"
          count={!isLoading && !error ? disciplines.length : undefined}
          countLabel={disciplines.length === 1 ? 'disciplina' : 'disciplinas'}
        >
          <StateBlock
            loading={isLoading}
            loadingText="Carregando disciplinas..."
            error={error}
            onRetry={fetchDisciplines}
            empty={disciplines.length === 0}
            emptyText="Nenhuma disciplina cadastrada."
          >
            <div className={tableStyles.wrapper}>
              <table className={tableStyles.table}>
                <thead>
                  <tr>
                    {['Nome', 'Descrição', 'Professores', 'Ações'].map((h) => (
                      <th key={h} className={tableStyles.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {disciplines.map((d) => (
                    <tr key={d.id} className={tableStyles.trHover}>
                      <td className={tableStyles.td}>{d.name}</td>
                      <td className={`${tableStyles.td} text-[var(--color-text-muted)] max-w-xs truncate`}>
                        {d.description || '—'}
                      </td>
                      <td className={tableStyles.td}>
                        {d.teachers?.map((t) => t.name).join(', ') || '—'}
                      </td>
                      <td className={tableStyles.actionsCell}>
                        <button
                          type="button"
                          onClick={() => handleEdit(d)}
                          title="Editar disciplina"
                          className="flex items-center justify-center w-7 h-7 rounded-md border border-[var(--color-border)] bg-transparent text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] cursor-pointer transition-colors ml-auto"
                        >
                          <FiEdit2 size={15} />
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

      <Modal
        open={showModal}
        onClose={handleClose}
        title={editing ? 'Editar Disciplina' : 'Nova Disciplina'}
        footer={
          <>
            <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>Cancelar</Button>
            <Button type="submit" form="discipline-form" loading={isSubmitting}>
              {editing ? 'Salvar' : 'Criar'}
            </Button>
          </>
        }
      >
        <form id="discipline-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
          {submitError && <Alert type="error">{submitError}</Alert>}
          {submitSuccess && <Alert type="success">{submitSuccess}</Alert>}
          <FormField label="Nome" required>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Matemática"
              required
              maxLength={150}
              disabled={isSubmitting}
            />
          </FormField>
          <FormField label="Descrição">
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição opcional"
              maxLength={5000}
              rows={3}
              disabled={isSubmitting}
            />
          </FormField>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-[var(--color-text-primary)]">Professores vinculados</span>
            {teachers.length === 0 ? (
              <p className="text-sm text-[var(--color-text-muted)]">Nenhum professor cadastrado.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {teachers.map((t) => (
                  <label key={t.id} className="flex items-center gap-2 text-sm text-[var(--color-text-primary)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedTeacherIds.includes(t.id)}
                      onChange={() => toggleTeacher(t.id)}
                      disabled={isSubmitting}
                      className="accent-[var(--color-primary)] w-4 h-4"
                    />
                    {t.name}
                  </label>
                ))}
              </div>
            )}
          </div>
        </form>
      </Modal>
    </div>
  )
}
