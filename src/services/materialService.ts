import api from './api'

export interface DisciplineMaterial {
  id: number
  disciplineId: number
  disciplineName: string
  classId: number | null
  className: string | null
  title: string
  description: string | null
  materialType: string | null
  filePath: string | null
  createdAt: string
}

export interface CreateDisciplineMaterialRequest {
  disciplineId: number
  classId: number
  title: string
  description?: string
  materialType?: string
  filePath?: string
}

export async function getMaterials(params?: {
  classId?: number
  disciplineId?: number
}): Promise<DisciplineMaterial[]> {
  const search = new URLSearchParams()
  if (params?.classId != null) search.set('classId', String(params.classId))
  if (params?.disciplineId != null) search.set('disciplineId', String(params.disciplineId))
  const qs = search.toString()
  return api.get<DisciplineMaterial[]>(`/materials${qs ? `?${qs}` : ''}`)
}

export async function createMaterial(data: CreateDisciplineMaterialRequest): Promise<DisciplineMaterial> {
  return api.post<DisciplineMaterial>('/materials', data)
}

export async function deleteMaterial(id: number): Promise<void> {
  return api.delete(`/materials/${id}`)
}
