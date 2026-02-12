import { useState, useEffect, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { register, getErrorMessage } from '../../services/authService'
import { ApiError } from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import { searchClasses, searchResponsibles, createClass } from '../../services/userService'
import type {
  UserRole,
  RegisterUserRequest,
  ResponsibleData,
  ClassSearchResponse,
  ResponsibleSearchResponse,
  CreateClassRequest,
} from '../../types/auth'
import './RegisterUser.css'

type ResponsibleMode = 'existing' | 'new'

const INITIAL_RESPONSIBLE_DATA: ResponsibleData = {
  name: '',
  phone: '',
  alternativePhone: '',
  email: '',
  alternativeEmail: '',
}

const ACADEMIC_YEAR_OPTIONS = [
  { value: '1º ano - Fundamental', label: '1º ano - Fundamental' },
  { value: '2º ano - Fundamental', label: '2º ano - Fundamental' },
  { value: '3º ano - Fundamental', label: '3º ano - Fundamental' },
  { value: '4º ano - Fundamental', label: '4º ano - Fundamental' },
  { value: '5º ano - Fundamental', label: '5º ano - Fundamental' },
  { value: '6º ano', label: '6º ano' },
  { value: '7º ano', label: '7º ano' },
  { value: '8º ano', label: '8º ano' },
  { value: '9º ano', label: '9º ano' },
  { value: '1º ano - Médio', label: '1º ano - Médio' },
  { value: '2º ano - Médio', label: '2º ano - Médio' },
  { value: '3º ano - Médio', label: '3º ano - Médio' },
]

export function RegisterUser() {
  const navigate = useNavigate()
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
    if (role === 'STUDENT') {
      setLoadingDropdowns(true)
      Promise.all([
        searchClasses().catch(() => []),
        searchResponsibles().catch(() => []),
      ])
        .then(([classes, responsibles]) => {
          setAvailableClasses(classes)
          setAvailableResponsibles(responsibles)
        })
        .finally(() => {
          setLoadingDropdowns(false)
        })
    }
  }, [role])

  const resetForm = () => {
    setName('')
    setPassword('')
    setBirthDate('')
    setGender('')
    setClassId('')
    setResponsibleMode('new')
    setResponsibleId('')
    setResponsibleData(INITIAL_RESPONSIBLE_DATA)
    setFieldErrors({})
  }

  const refreshClasses = async () => {
    try {
      const classes = await searchClasses()
      setAvailableClasses(classes)
    } catch {
    }
  }

  const handleOpenClassModal = () => {
    setNewClassName('')
    setNewClassAcademicYear('')
    setClassModalError(null)
    setShowClassModal(true)
  }

  const handleCloseClassModal = () => {
    setShowClassModal(false)
    setClassModalError(null)
  }

  const handleCreateClass = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setClassModalError(null)
    setIsCreatingClass(true)

    try {
      const requestData: CreateClassRequest = {
        name: newClassName,
        academicYear: newClassAcademicYear,
      }

      const response = await createClass(requestData)
      showToast(`Turma "${response.name}" criada com sucesso!`, 'success')
      await refreshClasses()
      setClassId(String(response.id))
      handleCloseClassModal()
    } catch (err) {
      if (err instanceof ApiError) {
        setClassModalError(err.message)
      } else {
        setClassModalError('Erro ao criar turma.')
      }
    } finally {
      setIsCreatingClass(false)
    }
  }

  const handleResponsibleChange = (field: keyof ResponsibleData, value: string) => {
    setResponsibleData((prev) => ({ ...prev, [field]: value }))
  }

  const formatPhone = (value: string): string => {
    const numbers = value.replace(/\D/g, '')
    let formatted = ''
    if (numbers.length > 0) {
      formatted = '(' + numbers.slice(0, 2)
    }
    if (numbers.length > 2) {
      formatted += ') ' + numbers.slice(2, 7)
    }
    if (numbers.length > 7) {
      formatted += '-' + numbers.slice(7, 11)
    }
    return formatted
  }

  const handlePhoneChange = (field: 'phone' | 'alternativePhone', value: string) => {
    const formatted = formatPhone(value)
    setResponsibleData((prev) => ({ ...prev, [field]: formatted }))
  }

  const handleBirthDateChange = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    let formatted = ''
    if (numbers.length > 0) {
      formatted = numbers.slice(0, 2)
    }
    if (numbers.length > 2) {
      formatted += '/' + numbers.slice(2, 4)
    }
    if (numbers.length > 4) {
      formatted += '/' + numbers.slice(4, 8)
    }
    
    setBirthDate(formatted)
  }

  const birthDateToISO = (brDate: string): string => {
    const parts = brDate.split('/')
    if (parts.length === 3 && parts[0].length === 2 && parts[1].length === 2 && parts[2].length === 4) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`
    }
    return brDate
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setFieldErrors({})
    setIsLoading(true)

    try {
      const requestData: RegisterUserRequest = {
        name,
        password,
        birthDate: birthDateToISO(birthDate),
        gender,
        role,
      }

      if (role === 'STUDENT') {
        if (classId) {
          requestData.classId = parseInt(classId, 10)
        }

        if (responsibleMode === 'existing' && responsibleId) {
          requestData.responsibleId = parseInt(responsibleId, 10)
        } else if (responsibleMode === 'new') {
          requestData.responsibleData = {
            name: responsibleData.name,
            phone: responsibleData.phone,
            email: responsibleData.email,
            alternativePhone: responsibleData.alternativePhone || undefined,
            alternativeEmail: responsibleData.alternativeEmail || undefined,
          }
        }
      }

      const response = await register(requestData)
      showToast(`Usuário "${response.name}" cadastrado com sucesso como ${getRoleLabel(response.role)}.`, 'success')
      resetForm()

      if (!addAnother) {
        navigate('/')
      }
    } catch (err) {
      if (err instanceof ApiError && err.code === 'VALIDATION_ERROR' && err.errors) {
        const errors: Record<string, string> = {}
        for (const fieldErr of err.errors) {
          errors[fieldErr.field] = fieldErr.message
        }
        setFieldErrors(errors)
        setError('Corrija os erros nos campos abaixo.')
      } else {
        setError(getErrorMessage(err))
      }
    } finally {
      setIsLoading(false)
    }
  }

  const getRoleLabel = (r: string): string => {
    switch (r) {
      case 'ADMIN':
        return 'Administrador'
      case 'TEACHER':
        return 'Professor'
      case 'STUDENT':
        return 'Aluno'
      default:
        return r
    }
  }

  return (
    <div className="register-container">
      <header className="register-header">
        <div className="register-header-content">
          <button onClick={() => navigate('/')} className="btn-back">
            &#8592; Voltar
          </button>
          <h1>Cadastrar Usuário</h1>
        </div>
      </header>

      <div className="register-content">
        <div className="register-card">
          <div className="role-selector">
            <span className="role-selector-label">Tipo de Usuário</span>
            <div className="role-options">
              {(['TEACHER', 'STUDENT', 'ADMIN'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  className={`role-option${role === r ? ' active' : ''}`}
                  onClick={() => setRole(r)}
                  disabled={isLoading}
                >
                  {getRoleLabel(r)}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="register-form">
            {error && (
              <div className="alert-error" role="alert">
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Nome <span className="required">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`form-input${fieldErrors.name ? ' input-error' : ''}`}
                placeholder="Nome completo"
                required
                maxLength={255}
                disabled={isLoading}
              />
              {fieldErrors.name && <span className="field-error">{fieldErrors.name}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Senha <span className="required">*</span>
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`form-input${fieldErrors.password ? ' input-error' : ''}`}
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                  disabled={isLoading}
                />
                {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="gender" className="form-label">
                  Gênero <span className="required">*</span>
                </label>
                <select
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className={`form-select${fieldErrors.gender ? ' input-error' : ''}`}
                  required
                  disabled={isLoading}
                >
                  <option value="" disabled>
                    Selecione
                  </option>
                  <option value="Masculino">Masculino</option>
                  <option value="Feminino">Feminino</option>
                  <option value="Outro">Outro</option>
                </select>
                {fieldErrors.gender && <span className="field-error">{fieldErrors.gender}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="birthDate" className="form-label">
                Data de Nascimento <span className="required">*</span>
              </label>
              <input
                id="birthDate"
                type="text"
                inputMode="numeric"
                value={birthDate}
                onChange={(e) => handleBirthDateChange(e.target.value)}
                className={`form-input${fieldErrors.birthDate ? ' input-error' : ''}`}
                placeholder="DD/MM/AAAA"
                maxLength={10}
                required
                disabled={isLoading}
              />
              {fieldErrors.birthDate && <span className="field-error">{fieldErrors.birthDate}</span>}
            </div>

            {role === 'STUDENT' && (
              <div className="form-section">
                <h3 className="form-section-title">Dados do Aluno</h3>

                <div className="form-group">
                  <label htmlFor="classId" className="form-label">
                    Turma (opcional)
                  </label>
                  <div className="input-with-action">
                    <select
                      id="classId"
                      value={classId}
                      onChange={(e) => setClassId(e.target.value)}
                      className={`form-select${fieldErrors.classId ? ' input-error' : ''}`}
                      disabled={isLoading || loadingDropdowns}
                    >
                      <option value="">
                        {loadingDropdowns ? 'Carregando turmas...' : 'Selecione uma turma'}
                      </option>
                      {availableClasses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.academicYear})
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={handleOpenClassModal}
                      className="btn-add-inline"
                      title="Adicionar nova turma"
                      disabled={isLoading}
                    >
                      +
                    </button>
                  </div>
                  {fieldErrors.classId && <span className="field-error">{fieldErrors.classId}</span>}
                </div>

                <div className="form-section">
                  <h3 className="form-section-title">Responsável Legal</h3>

                  <div className="responsible-toggle">
                    <button
                      type="button"
                      className={`responsible-toggle-btn${responsibleMode === 'new' ? ' active' : ''}`}
                      onClick={() => setResponsibleMode('new')}
                      disabled={isLoading}
                    >
                      Cadastrar novo responsável
                    </button>
                    <button
                      type="button"
                      className={`responsible-toggle-btn${responsibleMode === 'existing' ? ' active' : ''}`}
                      onClick={() => setResponsibleMode('existing')}
                      disabled={isLoading}
                    >
                      Usar responsável existente
                    </button>
                  </div>

                  {responsibleMode === 'existing' ? (
                    <div className="form-group">
                      <label htmlFor="responsibleId" className="form-label">
                        Responsável
                      </label>
                      <select
                        id="responsibleId"
                        value={responsibleId}
                        onChange={(e) => setResponsibleId(e.target.value)}
                        className={`form-select${fieldErrors.responsibleId ? ' input-error' : ''}`}
                        disabled={isLoading || loadingDropdowns}
                      >
                        <option value="">
                          {loadingDropdowns ? 'Carregando responsáveis...' : 'Selecione um responsável'}
                        </option>
                        {availableResponsibles.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name} - {r.email}
                          </option>
                        ))}
                      </select>
                      {availableResponsibles.length === 0 && !loadingDropdowns && (
                        <span className="field-hint">Nenhum responsável cadastrado. Cadastre um novo responsável.</span>
                      )}
                      {fieldErrors.responsibleId && (
                        <span className="field-error">{fieldErrors.responsibleId}</span>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="form-group">
                        <label htmlFor="respName" className="form-label">
                          Nome do Responsável <span className="required">*</span>
                        </label>
                        <input
                          id="respName"
                          type="text"
                          value={responsibleData.name}
                          onChange={(e) => handleResponsibleChange('name', e.target.value)}
                          className={`form-input${fieldErrors['responsibleData.name'] ? ' input-error' : ''}`}
                          placeholder="Nome completo do responsável"
                          required
                          maxLength={255}
                          disabled={isLoading}
                        />
                        {fieldErrors['responsibleData.name'] && (
                          <span className="field-error">{fieldErrors['responsibleData.name']}</span>
                        )}
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="respPhone" className="form-label">
                            Telefone <span className="required">*</span>
                          </label>
                          <input
                            id="respPhone"
                            type="text"
                            inputMode="numeric"
                            value={responsibleData.phone}
                            onChange={(e) => handlePhoneChange('phone', e.target.value)}
                            className={`form-input${fieldErrors['responsibleData.phone'] ? ' input-error' : ''}`}
                            placeholder="(31) 97215-2822"
                            required
                            maxLength={15}
                            disabled={isLoading}
                          />
                          {fieldErrors['responsibleData.phone'] && (
                            <span className="field-error">{fieldErrors['responsibleData.phone']}</span>
                          )}
                        </div>

                        <div className="form-group">
                          <label htmlFor="respAltPhone" className="form-label">
                            Telefone Alternativo
                          </label>
                          <input
                            id="respAltPhone"
                            type="text"
                            inputMode="numeric"
                            value={responsibleData.alternativePhone || ''}
                            onChange={(e) => handlePhoneChange('alternativePhone', e.target.value)}
                            className="form-input"
                            placeholder="(31) 97215-2822"
                            maxLength={15}
                            disabled={isLoading}
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="respEmail" className="form-label">
                            E-mail do Responsável <span className="required">*</span>
                          </label>
                          <input
                            id="respEmail"
                            type="email"
                            value={responsibleData.email}
                            onChange={(e) => handleResponsibleChange('email', e.target.value)}
                            className={`form-input${fieldErrors['responsibleData.email'] ? ' input-error' : ''}`}
                            placeholder="responsavel@email.com"
                            required
                            maxLength={255}
                            disabled={isLoading}
                          />
                          {fieldErrors['responsibleData.email'] && (
                            <span className="field-error">{fieldErrors['responsibleData.email']}</span>
                          )}
                        </div>

                        <div className="form-group">
                          <label htmlFor="respAltEmail" className="form-label">
                            E-mail Alternativo
                          </label>
                          <input
                            id="respAltEmail"
                            type="email"
                            value={responsibleData.alternativeEmail || ''}
                            onChange={(e) => handleResponsibleChange('alternativeEmail', e.target.value)}
                            className="form-input"
                            placeholder="alternativo@email.com"
                            maxLength={255}
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            <div className="form-actions">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={addAnother}
                  onChange={(e) => setAddAnother(e.target.checked)}
                  disabled={isLoading}
                />
                <span>Cadastrar e adicionar outro</span>
              </label>

              <button
                type="submit"
                className="btn-primary btn-submit"
                disabled={isLoading}
              >
                {isLoading ? 'Cadastrando...' : 'Cadastrar Usuário'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {showClassModal && (
        <div className="modal-overlay" onClick={handleCloseClassModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Nova Turma</h2>
              <button onClick={handleCloseClassModal} className="modal-close" type="button">
                &times;
              </button>
            </div>
            <form onSubmit={handleCreateClass} className="modal-form">
              {classModalError && (
                <div className="alert-error" role="alert">
                  {classModalError}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="newClassName" className="form-label">
                  Nome da Turma <span className="required">*</span>
                </label>
                <input
                  id="newClassName"
                  type="text"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="form-input"
                  placeholder="Ex: Turma A"
                  required
                  maxLength={100}
                  disabled={isCreatingClass}
                />
              </div>

              <div className="form-group">
                <label htmlFor="newClassAcademicYear" className="form-label">
                  Série/Ano Letivo <span className="required">*</span>
                </label>
                <select
                  id="newClassAcademicYear"
                  value={newClassAcademicYear}
                  onChange={(e) => setNewClassAcademicYear(e.target.value)}
                  className="form-select"
                  required
                  disabled={isCreatingClass}
                >
                  <option value="" disabled>Selecione a série</option>
                  {ACADEMIC_YEAR_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={handleCloseClassModal}
                  className="btn-secondary"
                  disabled={isCreatingClass}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isCreatingClass}
                >
                  {isCreatingClass ? 'Criando...' : 'Criar Turma'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
