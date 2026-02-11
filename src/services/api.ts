// Configuração base da API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

// Função para obter o token do localStorage
function getToken(): string | null {
  return localStorage.getItem('token')
}

// Função para fazer requisições autenticadas
async function fetchWithAuth(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getToken()
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  // Se receber 401, token pode estar expirado ou inválido
  if (response.status === 401) {
    // Remove token inválido
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    // Redireciona para login (será tratado pelo AuthContext)
    window.location.href = '/login'
  }

  return response
}

// Funções auxiliares para diferentes métodos HTTP
export const api = {
  get: async <T>(endpoint: string): Promise<T> => {
    const response = await fetchWithAuth(endpoint, { method: 'GET' })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  },

  post: async <T>(endpoint: string, data?: unknown): Promise<T> => {
    const response = await fetchWithAuth(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erro desconhecido' }))
      // Preserva a estrutura do erro para permitir tratamento específico
      const errorObj = error as { message?: string; errors?: Array<{ field: string; message: string }> }
      // Cria um erro customizado que preserva a estrutura
      const errorMessage = new Error(errorObj.message || `HTTP error! status: ${response.status}`) as Error & {
        errors?: Array<{ field: string; message: string }>
      }
      if (errorObj.errors) {
        errorMessage.errors = errorObj.errors
      }
      throw errorMessage
    }
    return response.json()
  },

  put: async <T>(endpoint: string, data?: unknown): Promise<T> => {
    const response = await fetchWithAuth(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  },

  delete: async <T>(endpoint: string): Promise<T> => {
    const response = await fetchWithAuth(endpoint, { method: 'DELETE' })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  },
}

export default api
