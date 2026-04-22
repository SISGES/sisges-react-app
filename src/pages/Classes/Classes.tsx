import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiEdit2, FiInfo, FiPlus, FiTrash2 } from 'react-icons/fi'
import { BackButton } from '../../components/BackButton/BackButton'
import { searchClasses, createClass, deleteClass } from '../../services/userService'
import { ApiError } from '../../services/api'
import type { ClassSearchResponse, CreateClassRequest } from '../../types/auth'
import { PageHeader, Button, Modal, ConfirmModal, DataCard, StateBlock, tableStyles, FormField, Input, Select, Alert } from '../../components/ui'

const ACADEMIC_YEAR_OPTIONS = [
  '1º ano - Fundamental', '2º ano - Fundamental', '3º ano - Fundamental',
  '4º ano - Fundamental', '5º ano - Fundamental',
  '6º ano', '7º ano', '8º ano', '9º ano',
  '1º ano - Médio', '2º ano - Médio', '3º ano - Médio',
]

export function Classes() {
  const navigate = useNavigate()
  const [classes, setClasses] = useState<ClassSearchResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showModal, setShowModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)
  const [className, setClassName] = useState('')
  const [academicYear, setAcademicYear] = useState('')

  const [deleteTarget, setDeleteTarget] = useState<ClassSearchResponse | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchClasses = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      setClasses(await searchClasses())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar turmas.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { fetchClasses() }, [fetchClasses])

  const resetForm = () => {
    setClassName('')
    setAcademicYear('')
    setSubmitError(null)
    setSubmitSuccess(null)
  }

  const handleCloseModal = () => { setShowModal(false); resetForm() }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await deleteClass(deleteTarget.id)
      setDeleteTarget(null)
      fetchClasses()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao excluir turma.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitError(null)
    setSubmitSuccess(null)
    setIsSubmitting(true)
    try {
      const req: CreateClassRequest = { name: className, academicYear }
      const res = await createClass(req)
      setSubmitSuccess(`Turma "${res.name}" criada com sucesso!`)
      resetForm()
      fetchClasses()
      setTimeout(handleCloseModal, 1500)
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : 'Erro ao criar turma.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <PageHeader
        title="Gestão de Turmas"
        back={<BackButton to="/" />}
        action={
          <Button size="sm" icon={<FiPlus size={14} />} onClick={() => { resetForm(); setShowModal(true) }}>
            Nova turma
          </Button>
        }
      />

      <div className="flex-1 p-6">
        <DataCard
          title="Turmas Cadastradas"
          count={!isLoading && !error ? classes.length : undefined}
          countLabel={classes.length === 1 ? 'turma' : 'turmas'}
        >
          <StateBlock
            loading={isLoading}
            loadingText="Carregando turmas..."
            error={error}
            onRetry={fetchClasses}
            empty={classes.length === 0}
            emptyText="Nenhuma turma cadastrada."
          >
            <div className={tableStyles.wrapper}>
              <table className={tableStyles.table}>
                <thead>
                  <tr>
                    {['Nome', 'Série', 'Alunos', 'Professores', 'Ações'].map((h) => (
                      <th key={h} className={tableStyles.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {classes.map((c) => (
                    <tr key={c.id} className={tableStyles.trHover}>
                      <td className={tableStyles.td}>{c.name}</td>
                      <td className={tableStyles.td}>{c.academicYear}</td>
                      <td className={tableStyles.td}>{c.studentCount}</td>
                      <td className={tableStyles.td}>{c.teacherCount}</td>
                      <td className={tableStyles.actionsCell}>
                        <div className="flex items-center justify-end gap-1.5">
                          <IconBtn title="Detalhes" onClick={() => navigate(`/admin/classes/${c.id}/edit`)}>
                            <FiInfo size={15} />
                          </IconBtn>
                          <IconBtn title="Editar" onClick={() => navigate(`/admin/classes/${c.id}/edit`)}>
                            <FiEdit2 size={15} />
                          </IconBtn>
                          <IconBtn title="Excluir" danger onClick={() => setDeleteTarget(c)}>
                            <FiTrash2 size={15} />
                          </IconBtn>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </StateBlock>
        </DataCard>
      </div>

      {/* Create modal */}
      <Modal
        open={showModal}
        onClose={handleCloseModal}
        title="Nova Turma"
        footer={
          <>
            <Button variant="secondary" onClick={handleCloseModal} disabled={isSubmitting}>Cancelar</Button>
            <Button type="submit" form="class-form" loading={isSubmitting}>Criar Turma</Button>
          </>
        }
      >
        <form id="class-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
          {submitError && <Alert type="error">{submitError}</Alert>}
          {submitSuccess && <Alert type="success">{submitSuccess}</Alert>}
          <FormField label="Nome da Turma" required>
            <Input
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              placeholder="Ex: 1º Ano A"
              required
              maxLength={100}
              disabled={isSubmitting}
            />
          </FormField>
          <FormField label="Série / Ano Letivo" required>
            <Select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              required
              disabled={isSubmitting}
            >
              <option value="" disabled>Selecione a série</option>
              {ACADEMIC_YEAR_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </Select>
          </FormField>
        </form>
      </Modal>

      {/* Delete confirm */}
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => { if (!isDeleting) setDeleteTarget(null) }}
        onConfirm={handleConfirmDelete}
        title="Excluir turma"
        message={<>Tem certeza que deseja excluir a turma <strong>{deleteTarget?.name}</strong>? Esta ação não pode ser desfeita.</>}
        confirmLabel={isDeleting ? 'Excluindo...' : 'Excluir'}
        loading={isDeleting}
      />
    </div>
  )
}

function IconBtn({ children, title, onClick, danger }: { children: React.ReactNode; title: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={[
        'flex items-center justify-center w-7 h-7 rounded-md border border-[var(--color-border)] bg-transparent cursor-pointer transition-colors',
        danger
          ? 'text-[var(--color-text-muted)] hover:text-[var(--color-error)] hover:border-[var(--color-error)]'
          : 'text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)]',
      ].join(' ')}
    >
      {children}
    </button>
  )
}
