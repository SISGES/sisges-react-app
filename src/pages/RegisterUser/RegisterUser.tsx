import { useState, useEffect, FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { FiPlus } from 'react-icons/fi'
import { BackButton } from '../../components/BackButton/BackButton'
import { register, getErrorMessage } from '../../services/authService'
import { ApiError } from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import { searchClasses, searchResponsibles, createClass } from '../../services/userService'
import type { UserRole, RegisterUserRequest, ResponsibleData, ClassSearchResponse, ResponsibleSearchResponse, CreateClassRequest } from '../../types/auth'
import { PageHeader, Button, Modal, FormField, Input, Select, Alert } from '../../components/ui'

type ResponsibleMode = 'existing' | 'new'

const INITIAL_RESPONSIBLE_DATA: ResponsibleData = { name: '', phone: '', alternativePhone: '', email: '', alternativeEmail: '' }

const ACADEMIC_YEAR_OPTIONS = [
  '1º ano - Fundamental', '2º ano - Fundamental', '3º ano - Fundamental',
  '4º ano - Fundamental', '5º ano - Fundamental',
  '6º ano', '7º ano', '8º ano', '9º ano',
  '1º ano - Médio', '2º ano - Médio', '3º ano - Médio',
]

const ROLE_LABELS: Record<string, string> = { TEACHER: 'Professor', STUDENT: 'Aluno', ADMIN: 'Administrador' }

function getRoleLabel(r: string) { return ROLE_LABELS[r] ?? r }

export function RegisterUser() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { showToast } = useToast()

  const [role, setRole] = useState<UserRole>('TEACHER')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [gender, setGender] = useState('')
  const [classId, setClassId] = useState('')
  const [responsibleMode, setResponsibleMode] = useState<ResponsibleMode>('new')
  const [responsibleId, setResponsibleId] = useState('')
  const [responsibleData, setResponsibleData] = useState<ResponsibleData>(INITIAL_RESPONSIBLE_DATA)
  const [addAnother, setAddAnother] = useState(false)
  const [availableClasses, setAvailableClasses] = useState<ClassSearchResponse[]>([])
  const [availableResponsibles, setAvailableResponsibles] = useState<ResponsibleSearchResponse[]>([])
  const [loadingDropdowns, setLoadingDropdowns] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [showClassModal, setShowClassModal] = useState(false)
  const [newClassName, setNewClassName] = useState('')
  const [newClassAcademicYear, setNewClassAcademicYear] = useState('')
  const [isCreatingClass, setIsCreatingClass] = useState(false)
  const [classModalError, setClassModalError] = useState<string | null>(null)

  useEffect(() => {
    const r = searchParams.get('role')
    if (r === 'STUDENT' || r === 'TEACHER' || r === 'ADMIN') setRole(r as UserRole)
  }, [searchParams])

  useEffect(() => {
    if (role !== 'STUDENT') return
    setLoadingDropdowns(true)
    Promise.all([searchClasses().catch(() => []), searchResponsibles().catch(() => [])])
      .then(([classes, responsibles]) => { setAvailableClasses(classes); setAvailableResponsibles(responsibles) })
      .finally(() => setLoadingDropdowns(false))
  }, [role])

  const resetForm = () => {
    setName(''); setPassword(''); setBirthDate(''); setGender('')
    setClassId(''); setResponsibleMode('new'); setResponsibleId('')
    setResponsibleData(INITIAL_RESPONSIBLE_DATA); setFieldErrors({})
  }

  const refreshClasses = async () => {
    try { setAvailableClasses(await searchClasses()) } catch { void 0 }
  }

  const handleCreateClass = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setClassModalError(null); setIsCreatingClass(true)
    try {
      const req: CreateClassRequest = { name: newClassName, academicYear: newClassAcademicYear }
      const res = await createClass(req)
      showToast(`Turma "${res.name}" criada com sucesso!`, 'success')
      await refreshClasses()
      setClassId(String(res.id))
      setShowClassModal(false); setNewClassName(''); setNewClassAcademicYear('')
    } catch (err) {
      setClassModalError(err instanceof ApiError ? err.message : 'Erro ao criar turma.')
    } finally {
      setIsCreatingClass(false)
    }
  }

  const formatPhone = (value: string): string => {
    const n = value.replace(/\D/g, '')
    let f = n.length > 0 ? '(' + n.slice(0, 2) : ''
    if (n.length > 2) f += ') ' + n.slice(2, 7)
    if (n.length > 7) f += '-' + n.slice(7, 11)
    return f
  }

  const handleBirthDateChange = (value: string) => {
    const n = value.replace(/\D/g, '')
    let f = n.slice(0, 2)
    if (n.length > 2) f += '/' + n.slice(2, 4)
    if (n.length > 4) f += '/' + n.slice(4, 8)
    setBirthDate(f)
  }

  const birthDateToISO = (brDate: string): string => {
    const parts = brDate.split('/')
    if (parts.length === 3 && parts[0].length === 2 && parts[1].length === 2 && parts[2].length === 4)
      return `${parts[2]}-${parts[1]}-${parts[0]}`
    return brDate
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setError(null); setFieldErrors({}); setIsLoading(true)
    try {
      const requestData: RegisterUserRequest = { name, password, birthDate: birthDateToISO(birthDate), gender, role }
      if (role === 'STUDENT') {
        if (classId) requestData.classId = parseInt(classId, 10)
        if (responsibleMode === 'existing' && responsibleId) requestData.responsibleId = parseInt(responsibleId, 10)
        else if (responsibleMode === 'new') requestData.responsibleData = { name: responsibleData.name, phone: responsibleData.phone, email: responsibleData.email, alternativePhone: responsibleData.alternativePhone || undefined, alternativeEmail: responsibleData.alternativeEmail || undefined }
      }
      const response = await register(requestData)
      showToast(`Usuário "${response.name}" cadastrado como ${getRoleLabel(response.role)}.`, 'success')
      resetForm()
      if (!addAnother) navigate('/')
    } catch (err) {
      if (err instanceof ApiError && err.code === 'VALIDATION_ERROR' && err.errors) {
        const errors: Record<string, string> = {}
        for (const fe of err.errors) errors[fe.field] = fe.message
        setFieldErrors(errors); setError('Corrija os erros nos campos abaixo.')
      } else {
        setError(getErrorMessage(err))
      }
    } finally {
      setIsLoading(false)
    }
  }

  const sectionCls = 'bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-5 flex flex-col gap-4'

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <PageHeader title="Cadastrar Usuário" back={<BackButton to="/" />} />

      <div className="mx-auto w-full max-w-5xl flex-1 p-6">
        <div className="flex flex-col gap-6">
          {/* Role selector */}
          <div className={sectionCls}>
            <p className="text-sm font-medium text-[var(--color-text-primary)]">Tipo de Usuário</p>
            <div className="flex gap-2 flex-wrap">
              {(['TEACHER', 'STUDENT', 'ADMIN'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  disabled={isLoading}
                  className={[
                    'px-4 py-2 text-sm font-medium rounded-md border transition-colors cursor-pointer disabled:opacity-50',
                    role === r
                      ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white'
                      : 'bg-transparent border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]',
                  ].join(' ')}
                >
                  {getRoleLabel(r)}
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {error && <Alert type="error">{error}</Alert>}

            <div className={sectionCls}>
              <FormField label="Nome" required error={fieldErrors.name}>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome completo" required maxLength={255} disabled={isLoading} />
              </FormField>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Senha" required error={fieldErrors.password}>
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" required minLength={6} disabled={isLoading} />
                </FormField>
                <FormField label="Gênero" required error={fieldErrors.gender}>
                  <Select value={gender} onChange={(e) => setGender(e.target.value)} required disabled={isLoading}>
                    <option value="" disabled>Selecione</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                    <option value="Outro">Outro</option>
                  </Select>
                </FormField>
              </div>
              <FormField label="Data de Nascimento" required error={fieldErrors.birthDate}>
                <Input type="text" inputMode="numeric" value={birthDate} onChange={(e) => handleBirthDateChange(e.target.value)} placeholder="DD/MM/AAAA" maxLength={10} required disabled={isLoading} />
              </FormField>
            </div>

            {/* Student-only fields */}
            {role === 'STUDENT' && (
              <>
                <div className={sectionCls}>
                  <p className="text-sm font-semibold text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-2">Dados do Aluno</p>
                  <FormField label="Turma (opcional)" error={fieldErrors.classId}>
                    <div className="flex gap-2">
                      <Select
                        value={classId}
                        onChange={(e) => setClassId(e.target.value)}
                        disabled={isLoading || loadingDropdowns}
                        className="flex-1"
                      >
                        <option value="">{loadingDropdowns ? 'Carregando...' : 'Selecione uma turma'}</option>
                        {availableClasses.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.academicYear})</option>)}
                      </Select>
                      <button
                        type="button"
                        onClick={() => { setNewClassName(''); setNewClassAcademicYear(''); setClassModalError(null); setShowClassModal(true) }}
                        disabled={isLoading}
                        title="Nova turma"
                        className="flex items-center justify-center w-9 h-9 rounded-md border border-[var(--color-border)] bg-transparent text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] cursor-pointer transition-colors disabled:opacity-50 flex-shrink-0"
                      >
                        <FiPlus size={16} />
                      </button>
                    </div>
                  </FormField>
                </div>

                <div className={sectionCls}>
                  <p className="text-sm font-semibold text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-2">Responsável Legal</p>
                  <div className="flex gap-2">
                    {(['new', 'existing'] as ResponsibleMode[]).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setResponsibleMode(m)}
                        disabled={isLoading}
                        className={[
                          'px-3 py-1.5 text-sm rounded-md border transition-colors cursor-pointer disabled:opacity-50',
                          responsibleMode === m
                            ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white'
                            : 'bg-transparent border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)]',
                        ].join(' ')}
                      >
                        {m === 'new' ? 'Novo responsável' : 'Responsável existente'}
                      </button>
                    ))}
                  </div>

                  {responsibleMode === 'existing' ? (
                    <FormField label="Responsável" error={fieldErrors.responsibleId}>
                      <Select value={responsibleId} onChange={(e) => setResponsibleId(e.target.value)} disabled={isLoading || loadingDropdowns}>
                        <option value="">{loadingDropdowns ? 'Carregando...' : 'Selecione um responsável'}</option>
                        {availableResponsibles.map((r) => <option key={r.id} value={r.id}>{r.name} - {r.email}</option>)}
                      </Select>
                      {availableResponsibles.length === 0 && !loadingDropdowns && (
                        <p className="text-xs text-[var(--color-text-muted)]">Nenhum responsável cadastrado.</p>
                      )}
                    </FormField>
                  ) : (
                    <>
                      <FormField label="Nome do Responsável" required error={fieldErrors['responsibleData.name']}>
                        <Input value={responsibleData.name} onChange={(e) => setResponsibleData((p) => ({ ...p, name: e.target.value }))} placeholder="Nome completo" required maxLength={255} disabled={isLoading} />
                      </FormField>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField label="Telefone" required error={fieldErrors['responsibleData.phone']}>
                          <Input type="text" inputMode="numeric" value={responsibleData.phone} onChange={(e) => setResponsibleData((p) => ({ ...p, phone: formatPhone(e.target.value) }))} placeholder="(31) 97215-2822" required maxLength={15} disabled={isLoading} />
                        </FormField>
                        <FormField label="Telefone Alternativo">
                          <Input type="text" inputMode="numeric" value={responsibleData.alternativePhone || ''} onChange={(e) => setResponsibleData((p) => ({ ...p, alternativePhone: formatPhone(e.target.value) }))} placeholder="(31) 97215-2822" maxLength={15} disabled={isLoading} />
                        </FormField>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField label="E-mail do Responsável" required error={fieldErrors['responsibleData.email']}>
                          <Input type="email" value={responsibleData.email} onChange={(e) => setResponsibleData((p) => ({ ...p, email: e.target.value }))} placeholder="responsavel@email.com" required maxLength={255} disabled={isLoading} />
                        </FormField>
                        <FormField label="E-mail Alternativo">
                          <Input type="email" value={responsibleData.alternativeEmail || ''} onChange={(e) => setResponsibleData((p) => ({ ...p, alternativeEmail: e.target.value }))} placeholder="alternativo@email.com" maxLength={255} disabled={isLoading} />
                        </FormField>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <label className="flex items-center gap-2 text-sm text-[var(--color-text-primary)] cursor-pointer">
                <input type="checkbox" checked={addAnother} onChange={(e) => setAddAnother(e.target.checked)} disabled={isLoading} className="accent-[var(--color-primary)] w-4 h-4" />
                Cadastrar e adicionar outro
              </label>
              <Button type="submit" loading={isLoading}>
                {isLoading ? 'Cadastrando...' : 'Cadastrar Usuário'}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Create class modal */}
      <Modal
        open={showClassModal}
        onClose={() => setShowClassModal(false)}
        title="Nova Turma"
        maxWidth="max-w-md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowClassModal(false)} disabled={isCreatingClass}>Cancelar</Button>
            <Button type="submit" form="register-class-form" loading={isCreatingClass}>Criar Turma</Button>
          </>
        }
      >
        <form id="register-class-form" onSubmit={handleCreateClass} className="flex flex-col gap-4">
          {classModalError && <Alert type="error">{classModalError}</Alert>}
          <FormField label="Nome da Turma" required>
            <Input value={newClassName} onChange={(e) => setNewClassName(e.target.value)} placeholder="Ex: Turma A" required maxLength={100} disabled={isCreatingClass} />
          </FormField>
          <FormField label="Série / Ano Letivo" required>
            <Select value={newClassAcademicYear} onChange={(e) => setNewClassAcademicYear(e.target.value)} required disabled={isCreatingClass}>
              <option value="" disabled>Selecione a série</option>
              {ACADEMIC_YEAR_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </Select>
          </FormField>
        </form>
      </Modal>
    </div>
  )
}
