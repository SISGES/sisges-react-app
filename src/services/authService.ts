import api from './api'
import type {
  LoginRequest,
  LoginResponse,
  LoginResponseUserInfo,
  User,
  LoginCredentials,
  RegisterUserRequest,
  UserResponse,
  ApiError,
  ApiErrorMessage,
  ApiValidationError,
} from '../types/auth'

// Re-exportar tipos para compatibilidade
export type { LoginCredentials, User, LoginResponse, RegisterUserRequest, UserResponse }

// Função para decodificar o JWT (apenas para obter dados básicos, não valida assinatura)
function decodeJWT(token: string): { exp?: number; [key: string]: unknown } | null {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Erro ao decodificar JWT:', error)
    return null
  }
}

// Verifica se o token está expirado
function isTokenExpired(token: string): boolean {
  const decoded = decodeJWT(token)
  if (!decoded || !decoded.exp) {
    return true
  }
  // exp está em segundos, Date.now() está em milissegundos
  return decoded.exp * 1000 < Date.now()
}

// Função de login
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>('/auth/login', credentials)
  
  // Salva token e usuário no localStorage
  if (response.accessToken) {
    localStorage.setItem('token', response.accessToken)
    // Normaliza o usuário para o formato interno do frontend
    const user: User = {
      id: response.user.id,
      name: response.user.name,
      email: response.user.email,
      register: response.user.register,
      role: response.user.role,
    }
    localStorage.setItem('user', JSON.stringify(user))
  }
  
  return response
}

// Função de logout
export function logout(): void {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

// Obtém o usuário atual do localStorage
export function getCurrentUser(): User | null {
  const userStr = localStorage.getItem('user')
  if (!userStr) return null
  
  try {
    const parsed = JSON.parse(userStr)
    // Garante que o usuário tem a estrutura correta
    return {
      id: parsed.id,
      name: parsed.name,
      email: parsed.email,
      register: parsed.register || '',
      role: parsed.role || 'STUDENT',
    } as User
  } catch {
    return null
  }
}

// Verifica se o usuário está autenticado
export function isAuthenticated(): boolean {
  const token = localStorage.getItem('token')
  if (!token) return false
  
  // Verifica se o token está expirado
  if (isTokenExpired(token)) {
    logout()
    return false
  }
  
  return true
}

// Obtém o token atual
export function getToken(): string | null {
  return localStorage.getItem('token')
}

// Valida o token (pode ser usado para verificar com o backend)
export async function validateToken(): Promise<boolean> {
  const token = getToken()
  if (!token || isTokenExpired(token)) {
    return false
  }

  try {
    // Faz uma requisição para validar o token com o backend
    await api.get('/auth/validate')
    return true
  } catch {
    logout()
    return false
  }
}

// Função de registro (cadastro de usuário)
export async function register(data: RegisterUserRequest): Promise<UserResponse> {
  const response = await api.post<UserResponse>('/auth/register', data)
  return response
}

// Função auxiliar para verificar se um erro é de validação
export function isValidationError(error: unknown): error is ApiValidationError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'errors' in error &&
    Array.isArray((error as ApiValidationError).errors)
  )
}

// Função auxiliar para extrair mensagem de erro
export function getErrorMessage(error: unknown): string {
  if (isValidationError(error)) {
    return error.errors.map((e) => `${e.field}: ${e.message}`).join(', ')
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return (error as ApiErrorMessage).message
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'Erro desconhecido'
}
