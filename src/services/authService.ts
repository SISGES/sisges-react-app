import api, { ApiError } from './api'
import type {
  LoginRequest,
  LoginResponse,
  User,
  LoginCredentials,
  RegisterUserRequest,
  UserResponse,
} from '../types/auth'

export type { LoginCredentials, User, LoginResponse, RegisterUserRequest, UserResponse, LoginRequest }
export { ApiError }

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

function isTokenExpired(token: string): boolean {
  const decoded = decodeJWT(token)
  if (!decoded || !decoded.exp) {
    return true
  }
  return decoded.exp * 1000 < Date.now()
}

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>('/auth/login', credentials)

  const maybeError = response as unknown as { code?: string; status?: number; message?: string; timestamp?: string }
  if (maybeError.code && !response.accessToken) {
    throw new ApiError({
      status: maybeError.status || 401,
      code: maybeError.code as import('../types/auth').SisgesErrorCode,
      message: maybeError.message || 'Erro ao fazer login',
      timestamp: maybeError.timestamp || new Date().toISOString(),
    })
  }

  if (response.accessToken) {
    localStorage.setItem('token', response.accessToken)
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
export function logout(): void {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

export function getCurrentUser(): User | null {
  const userStr = localStorage.getItem('user')
  if (!userStr) return null
  
  try {
    const parsed = JSON.parse(userStr)
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

export function isAuthenticated(): boolean {
  const token = localStorage.getItem('token')
  if (!token) return false
  
  if (isTokenExpired(token)) {
    logout()
    return false
  }
  
  return true
}

export function getToken(): string | null {
  return localStorage.getItem('token')
}

export async function validateToken(): Promise<boolean> {
  const token = getToken()
  if (!token || isTokenExpired(token)) {
    return false
  }

  try {
    await api.get('/auth/validate')
    return true
  } catch {
    logout()
    return false
  }
}

export async function register(data: RegisterUserRequest): Promise<UserResponse> {
  const response = await api.post<UserResponse>('/auth/register', data)
  return response
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

export function isValidationError(error: unknown): boolean {
  return error instanceof ApiError && error.code === 'VALIDATION_ERROR'
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'Erro desconhecido'
}
