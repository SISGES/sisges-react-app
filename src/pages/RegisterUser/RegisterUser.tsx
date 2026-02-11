import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { register, isValidationError, getErrorMessage } from '../../services/authService'
import type { UserRole, RegisterUserRequest, ResponsibleData } from '../../types/auth'
import './RegisterUser.css'

type ResponsibleMode = 'existing' | 'new'

const INITIAL_RESPONSIBLE_DATA: ResponsibleData = {
  name: '',
  phone: '',
  alternativePhone: '',
  email: '',
  alternativeEmail: '',
}

export function RegisterUser() {
  const navigate = useNavigate()

  // Role selection
  const [role, setRole] = useState<UserRole>('TEACHER')

  // Common fields
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [registerField, setRegisterField] = useState('')
  const [password, setPassword] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [gender, setGender] = useState('')

  // Student-specific fields
  const [classId, setClassId] = useState('')
  const [responsibleMode, setResponsibleMode] = useState<ResponsibleMode>('new')
  const [responsibleId, setResponsibleId] = useState('')
  const [responsibleData, setResponsibleData] = useState<ResponsibleData>(INITIAL_RESPONSIBLE_DATA)

  // UI state
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState<string | null>(null)

  const resetForm = () => {
    setName('')
    setEmail('')
    setRegisterField('')
    setPassword('')
    setBirthDate('')
    setGender('')
    setClassId('')
    setResponsibleMode('new')
    setResponsibleId('')
    setResponsibleData(INITIAL_RESPONSIBLE_DATA)
    setFieldErrors({})
  }

  const handleResponsibleChange = (field: keyof ResponsibleData, value: string) => {
    setResponsibleData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setFieldErrors({})
    setIsLoading(true)

    try {
      const requestData: RegisterUserRequest = {
        name,
        email,
        register: registerField,
        password,
        birthDate,
        gender,
        role,
      }

      // Add student-specific fields
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
      setSuccess(`Usuário "${response.name}" cadastrado com sucesso como ${getRoleLabel(response.role)}.`)
      resetForm()
    } catch (err) {
      if (isValidationError(err)) {
        // Map field-level errors
        const errors: Record<string, string> = {}
        for (const fieldErr of (err as { errors: Array<{ field: string; message: string }> }).errors) {
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
          {/* Role selector */}
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

            {success && (
              <div className="alert-success" role="status">
                {success}
              </div>
            )}

            {/* Common fields */}
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Nome
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
                <label htmlFor="email" className="form-label">
                  E-mail
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`form-input${fieldErrors.email ? ' input-error' : ''}`}
                  placeholder="usuario@email.com"
                  required
                  maxLength={255}
                  disabled={isLoading}
                />
                {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="register" className="form-label">
                  Registro/Matrícula
                </label>
                <input
                  id="register"
                  type="text"
                  value={registerField}
                  onChange={(e) => setRegisterField(e.target.value)}
                  className={`form-input${fieldErrors.register ? ' input-error' : ''}`}
                  placeholder="Número de registro"
                  required
                  maxLength={50}
                  disabled={isLoading}
                />
                {fieldErrors.register && <span className="field-error">{fieldErrors.register}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Senha
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
                  Gênero
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
                Data de Nascimento
              </label>
              <input
                id="birthDate"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className={`form-input${fieldErrors.birthDate ? ' input-error' : ''}`}
                required
                disabled={isLoading}
              />
              {fieldErrors.birthDate && <span className="field-error">{fieldErrors.birthDate}</span>}
            </div>

            {/* Student-specific fields */}
            {role === 'STUDENT' && (
              <div className="form-section">
                <h3 className="form-section-title">Dados do Aluno</h3>

                <div className="form-group">
                  <label htmlFor="classId" className="form-label">
                    ID da Turma (opcional)
                  </label>
                  <input
                    id="classId"
                    type="number"
                    value={classId}
                    onChange={(e) => setClassId(e.target.value)}
                    className={`form-input${fieldErrors.classId ? ' input-error' : ''}`}
                    placeholder="ID da turma"
                    disabled={isLoading}
                  />
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
                        ID do Responsável
                      </label>
                      <input
                        id="responsibleId"
                        type="number"
                        value={responsibleId}
                        onChange={(e) => setResponsibleId(e.target.value)}
                        className={`form-input${fieldErrors.responsibleId ? ' input-error' : ''}`}
                        placeholder="ID do responsável existente"
                        disabled={isLoading}
                      />
                      {fieldErrors.responsibleId && (
                        <span className="field-error">{fieldErrors.responsibleId}</span>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="form-group">
                        <label htmlFor="respName" className="form-label">
                          Nome do Responsável
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
                            Telefone
                          </label>
                          <input
                            id="respPhone"
                            type="text"
                            value={responsibleData.phone}
                            onChange={(e) => handleResponsibleChange('phone', e.target.value)}
                            className={`form-input${fieldErrors['responsibleData.phone'] ? ' input-error' : ''}`}
                            placeholder="(00) 00000-0000"
                            required
                            maxLength={30}
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
                            value={responsibleData.alternativePhone || ''}
                            onChange={(e) => handleResponsibleChange('alternativePhone', e.target.value)}
                            className="form-input"
                            placeholder="(00) 00000-0000"
                            maxLength={30}
                            disabled={isLoading}
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="respEmail" className="form-label">
                            E-mail do Responsável
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

            <button
              type="submit"
              className="btn-primary btn-submit"
              disabled={isLoading}
            >
              {isLoading ? 'Cadastrando...' : 'Cadastrar Usuário'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
