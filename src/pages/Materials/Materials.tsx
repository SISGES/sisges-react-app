import { useState, useEffect, useCallback } from 'react'
import { FiPlus, FiTrash2 } from 'react-icons/fi'
import { BackButton } from '../../components/BackButton/BackButton'
import { getMaterials, createMaterial, deleteMaterial } from '../../services/materialService'
import { searchClasses, getDisciplines } from '../../services/userService'
import { uploadFile } from '../../services/uploadService'
import type { DisciplineMaterial, CreateDisciplineMaterialRequest } from '../../services/materialService'
import type { ClassSearchResponse, DisciplineResponse } from '../../types/auth'
import { ApiError } from '../../services/api'
import { PageHeader, Button, Modal, StateBlock, FormField, Select, Input, Textarea, Alert } from '../../components/ui'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'
const UPLOAD_BASE = API_BASE.replace('/api', '')

const selectCls = 'px-3 py-2 text-sm bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] transition-colors'

export function Materials() {
  const [materials, setMaterials] = useState<DisciplineMaterial[]>([])
  const [classes, setClasses] = useState<ClassSearchResponse[]>([])
  const [disciplines, setDisciplines] = useState<DisciplineResponse[]>([])
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null)
  const [selectedDisciplineId, setSelectedDisciplineId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [materialFile, setMaterialFile] = useState<File | null>(null)
  const [modalDisciplineId, setModalDisciplineId] = useState<number | null>(null)

  const fetchMaterials = useCallback(async () => {
    if (!selectedClassId) { setMaterials([]); return }
    setIsLoading(true); setError(null)
    try { setMaterials(await getMaterials({ classId: selectedClassId, disciplineId: selectedDisciplineId ?? undefined })) }
    catch (err) { setError(err instanceof ApiError ? err.message : 'Erro ao carregar materiais.') }
    finally { setIsLoading(false) }
  }, [selectedClassId, selectedDisciplineId])

  useEffect(() => { fetchMaterials() }, [fetchMaterials])
  useEffect(() => {
    async function load() {
      try { const [c, d] = await Promise.all([searchClasses(), getDisciplines()]); setClasses(c); setDisciplines(d) }
      catch { void 0 }
    }
    load()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedClassId || !title.trim()) return
    const discId = modalDisciplineId ?? selectedDisciplineId ?? disciplines[0]?.id
    if (!discId) { setSubmitError('Selecione uma disciplina.'); return }
    setIsSubmitting(true); setSubmitError(null)
    try {
      let filePath: string | undefined
      if (materialFile) { const { path } = await uploadFile(materialFile, 'materials'); filePath = path }
      const data: CreateDisciplineMaterialRequest = { classId: selectedClassId, disciplineId: discId as number, title: title.trim(), description: description.trim() || undefined, filePath }
      await createMaterial(data)
      setTitle(''); setDescription(''); setMaterialFile(null); setModalDisciplineId(null); setShowModal(false)
      fetchMaterials()
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : 'Erro ao criar material.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Excluir este material?')) return
    try { await deleteMaterial(id); fetchMaterials() }
    catch (err) { alert(err instanceof ApiError ? err.message : 'Erro ao excluir.') }
  }

  const getFileUrl = (path: string | null) => path ? (path.startsWith('http') ? path : `${UPLOAD_BASE}${path}`) : null

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <PageHeader title="Materiais de Estudo" back={<BackButton to="/" />} />

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3 px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[var(--color-text-muted)]">Turma</label>
          <select value={selectedClassId ?? ''} onChange={(e) => setSelectedClassId(e.target.value ? Number(e.target.value) : null)} className={selectCls}>
            <option value="">Selecione a turma</option>
            {classes.map((c) => <option key={c.id} value={c.id}>{c.name} – {c.academicYear}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[var(--color-text-muted)]">Disciplina</label>
          <select value={selectedDisciplineId ?? ''} onChange={(e) => setSelectedDisciplineId(e.target.value ? Number(e.target.value) : null)} className={selectCls}>
            <option value="">Todas</option>
            {disciplines.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        {selectedClassId && (
          <Button size="sm" icon={<FiPlus size={14} />} onClick={() => { setTitle(''); setDescription(''); setMaterialFile(null); setModalDisciplineId(null); setSubmitError(null); setShowModal(true) }}>
            Novo material
          </Button>
        )}
      </div>

      <div className="flex-1 p-6">
        {!selectedClassId ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-sm text-[var(--color-text-muted)]">Selecione uma turma para ver os materiais.</p>
          </div>
        ) : (
          <StateBlock loading={isLoading} loadingText="Carregando materiais..." error={error} onRetry={fetchMaterials} empty={materials.length === 0} emptyText="Nenhum material cadastrado para esta turma.">
            <div className="flex flex-col gap-3">
              {materials.map((m) => (
                <div key={m.id} className="flex items-start justify-between gap-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-4">
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="text-sm font-semibold text-[var(--color-text-primary)]">{m.title}</span>
                    <span className="text-xs text-[var(--color-text-muted)]">{m.disciplineName}</span>
                    {m.description && <p className="text-sm text-[var(--color-text-secondary)]">{m.description}</p>}
                    {m.filePath && (
                      <a href={getFileUrl(m.filePath) ?? '#'} target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--color-primary)] hover:underline mt-1">
                        Baixar documento
                      </a>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(m.id)}
                    title="Excluir material"
                    className="flex items-center justify-center w-7 h-7 rounded-md border border-[var(--color-border)] bg-transparent text-[var(--color-text-muted)] hover:text-[var(--color-error)] hover:border-[var(--color-error)] cursor-pointer transition-colors flex-shrink-0"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </StateBlock>
        )}
      </div>

      <Modal
        open={showModal}
        onClose={() => !isSubmitting && setShowModal(false)}
        title="Novo Material"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)} disabled={isSubmitting}>Cancelar</Button>
            <Button type="submit" form="material-form" loading={isSubmitting}>Criar</Button>
          </>
        }
      >
        <form id="material-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
          {submitError && <Alert type="error">{submitError}</Alert>}
          <FormField label="Disciplina" required>
            <Select value={modalDisciplineId ?? selectedDisciplineId ?? ''} onChange={(e) => setModalDisciplineId(e.target.value ? Number(e.target.value) : null)} required disabled={isSubmitting}>
              <option value="">Selecione</option>
              {disciplines.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </Select>
          </FormField>
          <FormField label="Título" required>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={255} disabled={isSubmitting} />
          </FormField>
          <FormField label="Descrição">
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} disabled={isSubmitting} />
          </FormField>
          <FormField label="Arquivo (PDF, TXT, DOCX)">
            <input
              type="file"
              accept=".pdf,.txt,.docx,.doc"
              onChange={(e) => setMaterialFile(e.target.files?.[0] ?? null)}
              disabled={isSubmitting}
              className="text-sm text-[var(--color-text-primary)] file:mr-3 file:px-3 file:py-1.5 file:text-xs file:font-medium file:rounded-md file:border file:border-[var(--color-border)] file:bg-[var(--color-background)] file:text-[var(--color-text-primary)] file:cursor-pointer hover:file:bg-[var(--color-surface)] file:transition-colors"
            />
          </FormField>
        </form>
      </Modal>
    </div>
  )
}
