// ============================================
// TIPOS DE AUTENTICAÇÃO - SISGES
// Baseado em: FRONTEND_AUTH_TYPES.md
// ============================================

// ---- ROLES ----
export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT'

// ---- LOGIN ----
export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponseUserInfo {
  id: number
  name: string
  email: string
  register: string
  role: UserRole
}

export interface LoginResponse {
  accessToken: string
  tokenType: string
  user: LoginResponseUserInfo
}

// ---- CADASTRO (REGISTRO) ----
export interface ResponsibleData {
  name: string
  phone: string
  alternativePhone?: string
  email: string
  alternativeEmail?: string
}

export interface RegisterUserRequest {
  name: string
  email: string
  register: string
  password: string
  birthDate: string // ISO date "YYYY-MM-DD"
  gender: string
  role: UserRole
  responsibleId?: number | null
  classId?: number | null
  responsibleData?: ResponsibleData | null
}

export interface UserResponse {
  id: number
  name: string
  email: string
  register: string
  role: UserRole
  birthDate: string // ISO date "YYYY-MM-DD"
  gender: string
}

// ---- ERROS DA API ----
export interface ApiErrorMessage {
  message: string
}

export interface ApiValidationError {
  message: string
  errors: Array<{
    field: string
    message: string
  }>
}

// Tipo union para erros da API
export type ApiError = ApiErrorMessage | ApiValidationError

// ---- TIPOS AUXILIARES PARA O FRONTEND ----
// Tipo simplificado de usuário usado internamente no frontend
export interface User {
  id: number
  name: string
  email: string
  register: string
  role: UserRole
}

// Tipo para credenciais de login (alias para LoginRequest)
export type LoginCredentials = LoginRequest
