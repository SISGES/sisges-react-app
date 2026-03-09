const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

function getToken(): string | null {
  return localStorage.getItem('token')
}

export async function uploadFile(file: File, subdir: string = 'general'): Promise<{ path: string }> {
  const token = getToken()
  const formData = new FormData()
  formData.append('file', file)
  formData.append('subdir', subdir)

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error || 'Erro ao enviar arquivo')
  }

  const data = await response.json()
  return { path: data.path }
}
