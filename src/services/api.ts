import type { SisgesErrorResponse } from '../types/auth'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

export class ApiError extends Error {
  status: number
  code: string
  timestamp: string
  errors?: Array<{ field: string; message: string }>

  constructor(errorResponse: SisgesErrorResponse) {
    super(errorResponse.message)
    this.name = 'ApiError'
    this.status = errorResponse.status
    this.code = errorResponse.code
    this.timestamp = errorResponse.timestamp
    this.errors = errorResponse.errors
  }
}

function getToken(): string | null {
  return localStorage.getItem('token')
}

function isAuthEndpoint(endpoint: string): boolean {
  return endpoint.startsWith('/auth/')
}

function getDefaultMessageForStatus(status: number): string {
  switch (status) {
    case 400: return 'Requisição inválida'
    case 401: return 'Não autorizado. Faça login novamente.'
    case 403: return 'Acesso negado'
    case 404: return 'Recurso não encontrado'
    case 500: return 'Erro interno do servidor'
    default: return `Erro HTTP ${status}`
  }
}

async function handleErrorResponse(response: Response): Promise<never> {
  const text = await response.text()
  const errorData = (() => {
    if (!text.trim()) {
      return {
        status: response.status,
        code: 'INTERNAL_ERROR',
        message: getDefaultMessageForStatus(response.status),
        timestamp: new Date().toISOString(),
      } as SisgesErrorResponse
    }
    try {
      return JSON.parse(text) as SisgesErrorResponse
    } catch {
      return {
        status: response.status,
        code: 'INTERNAL_ERROR',
        message: getDefaultMessageForStatus(response.status),
        timestamp: new Date().toISOString(),
      } as SisgesErrorResponse
    }
  })()

  throw new ApiError({
    status: errorData.status || response.status,
    code: errorData.code || 'INTERNAL_ERROR',
    message: errorData.message || getDefaultMessageForStatus(response.status),
    timestamp: errorData.timestamp || new Date().toISOString(),
    errors: errorData.errors,
  })
}

async function fetchWithAuth(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getToken()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (response.status === 401 && !isAuthEndpoint(endpoint)) {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/login'
  }

  return response
}

export const api = {
  get: async <T>(endpoint: string): Promise<T> => {
    const response = await fetchWithAuth(endpoint, { method: 'GET' })
    if (!response.ok) {
      await handleErrorResponse(response)
    }
    return response.json()
  },

  post: async <T>(endpoint: string, data?: unknown): Promise<T> => {
    const response = await fetchWithAuth(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
    if (!response.ok) {
      await handleErrorResponse(response)
    }
    const text = await response.text()
    if (!text.trim()) return undefined as T
    return JSON.parse(text) as T
  },

  put: async <T>(endpoint: string, data?: unknown): Promise<T> => {
    const response = await fetchWithAuth(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
    if (!response.ok) {
      await handleErrorResponse(response)
    }
    const text = await response.text()
    if (!text.trim()) return undefined as T
    return JSON.parse(text) as T
  },

  delete: async <T>(endpoint: string): Promise<T> => {
    const response = await fetchWithAuth(endpoint, { method: 'DELETE' })
    if (!response.ok) {
      await handleErrorResponse(response)
    }
    const text = await response.text()
    if (!text.trim()) return undefined as T
    return JSON.parse(text) as T
  },
}

export default api
