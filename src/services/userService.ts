import api from './api'
import type {
  UserSearchResponse,
  UserDetailResponse,
  UserSearchFilters,
  TeacherSearchResponse,
  TeacherDetailResponse,
  TeacherSearchFilters,
  StudentSearchResponse,
  StudentDetailResponse,
  StudentSearchFilters,
  ClassSearchResponse,
  ClassDetailResponse,
  ClassSearchFilters,
  CreateClassRequest,
  ResponsibleSearchResponse,
  ResponsibleSearchFilters,
  DisciplineResponse,
  CreateDisciplineRequest,
  UpdateDisciplineRequest,
  AulaSearchFilters,
  AulaSearchResponse,
  AulaDetailResponse,
  CreateAulaRequest,
  UpdateAulaRequest,
  SubmitFrequencyRequest,
} from '../types/auth'

export type {
  UserSearchResponse,
  UserDetailResponse,
  TeacherSearchResponse,
  TeacherDetailResponse,
  StudentSearchResponse,
  StudentDetailResponse,
  ClassSearchResponse,
  ClassDetailResponse,
  ResponsibleSearchResponse,
  DisciplineResponse,
}

export type UserResponse = UserSearchResponse

export async function searchUsers(filters?: UserSearchFilters): Promise<UserSearchResponse[]> {
  const response = await api.post<UserSearchResponse[]>('/users/search', filters)
  return response
}

export async function getUserById(id: number): Promise<UserDetailResponse> {
  const response = await api.get<UserDetailResponse>(`/users/${id}`)
  return response
}

export async function getUsers(): Promise<UserSearchResponse[]> {
  return searchUsers()
}

export async function searchTeachers(filters?: TeacherSearchFilters): Promise<TeacherSearchResponse[]> {
  const response = await api.post<TeacherSearchResponse[]>('/teachers/search', filters)
  return response
}

export async function getTeacherById(id: number): Promise<TeacherDetailResponse> {
  const response = await api.get<TeacherDetailResponse>(`/teachers/${id}`)
  return response
}

/** Retorna o perfil do professor logado. Use para professores acessando seus próprios dados. */
export async function getTeacherMe(): Promise<TeacherDetailResponse> {
  const response = await api.get<TeacherDetailResponse>('/teachers/me')
  return response
}

export async function searchStudents(filters?: StudentSearchFilters): Promise<StudentSearchResponse[]> {
  const response = await api.post<StudentSearchResponse[]>('/students/search', filters)
  return response
}

export async function getStudentById(id: number): Promise<StudentDetailResponse> {
  const response = await api.get<StudentDetailResponse>(`/students/${id}`)
  return response
}

export async function searchClasses(filters?: ClassSearchFilters): Promise<ClassSearchResponse[]> {
  const response = await api.post<ClassSearchResponse[]>('/classes/search', filters)
  return response
}

export async function getClassById(id: number): Promise<ClassDetailResponse> {
  const response = await api.get<ClassDetailResponse>(`/classes/${id}`)
  return response
}

export async function createClass(data: CreateClassRequest): Promise<ClassDetailResponse> {
  const response = await api.post<ClassDetailResponse>('/classes', data)
  return response
}

export async function deleteClass(id: number): Promise<void> {
  await api.delete(`/classes/delete/${id}`)
}

export async function searchResponsibles(filters?: ResponsibleSearchFilters): Promise<ResponsibleSearchResponse[]> {
  const response = await api.post<ResponsibleSearchResponse[]>('/responsibles/search', filters)
  return response
}

export async function addTeacherToClass(classId: number, teacherId: number): Promise<ClassDetailResponse> {
  const response = await api.post<ClassDetailResponse>(`/classes/${classId}/teacher/add/${teacherId}`)
  return response
}

export async function addStudentToClass(classId: number, studentId: number): Promise<ClassDetailResponse> {
  const response = await api.post<ClassDetailResponse>(`/classes/${classId}/student/add/${studentId}`)
  return response
}

export async function removeTeacherFromClass(classId: number, teacherId: number): Promise<ClassDetailResponse> {
  const response = await api.post<ClassDetailResponse>(`/classes/${classId}/teacher/remove/${teacherId}`)
  return response
}

export async function removeStudentFromClass(classId: number, studentId: number): Promise<ClassDetailResponse> {
  const response = await api.post<ClassDetailResponse>(`/classes/${classId}/student/remove/${studentId}`)
  return response
}

export async function getDisciplines(): Promise<DisciplineResponse[]> {
  const response = await api.get<DisciplineResponse[]>('/disciplines')
  return response
}

export async function createDiscipline(data: CreateDisciplineRequest): Promise<DisciplineResponse> {
  const response = await api.post<DisciplineResponse>('/disciplines', data)
  return response
}

export async function updateDiscipline(id: number, data: UpdateDisciplineRequest): Promise<DisciplineResponse> {
  const response = await api.put<DisciplineResponse>(`/disciplines/update/${id}`, data)
  return response
}

export async function getDisciplineById(id: number): Promise<DisciplineResponse> {
  const response = await api.get<DisciplineResponse>(`/disciplines/${id}`)
  return response
}

export async function addDisciplineToClass(classId: number, disciplineId: number): Promise<ClassDetailResponse> {
  const response = await api.post<ClassDetailResponse>(`/classes/${classId}/discipline/add/${disciplineId}`)
  return response
}

export async function removeDisciplineFromClass(classId: number, disciplineId: number): Promise<ClassDetailResponse> {
  const response = await api.post<ClassDetailResponse>(`/classes/${classId}/discipline/remove/${disciplineId}`)
  return response
}

/* Aula (class meeting) endpoints - /api/class */
export async function searchAulas(filters?: AulaSearchFilters): Promise<AulaSearchResponse[]> {
  const body: {
    date?: string
    disciplineId?: number
    classId?: number
    teacherId?: number
  } = {}
  if (filters) {
    if (filters.date) body.date = filters.date
    if (filters.disciplineId != null) body.disciplineId = filters.disciplineId
    if (filters.schoolClassId != null) body.classId = filters.schoolClassId
    if (filters.teacherId != null) body.teacherId = filters.teacherId
  }
  const response = await api.post<AulaSearchResponse[]>('/class/search', body)
  return response
}

interface ClassMeetingApiResponse {
  id: number
  date?: string
  startTime?: string
  endTime?: string
  classInfo?: {
    id: number
    name: string
    academicYear: string
    students?: { id: number; name: string; email: string; present?: boolean | null }[]
  }
  teacher?: { id: number; name: string; email: string }
}

export async function getAulaById(id: number): Promise<AulaDetailResponse> {
  const data = await api.get<ClassMeetingApiResponse>(`/class/${id}`)
  const classInfo = data.classInfo
  const students = (classInfo?.students ?? []).map((s) => ({
    id: s.id,
    name: s.name,
    email: s.email,
    present: s.present,
  }))
  return {
    id: data.id,
    name: classInfo?.name ?? '',
    academicYear: classInfo?.academicYear ?? '',
    students,
    professor: data.teacher ?? { id: 0, name: '-', email: '' },
    date: data.date,
    startTime: data.startTime,
    endTime: data.endTime,
    disciplineId: undefined,
    schoolClassId: classInfo?.id,
  }
}

export async function createAula(data: CreateAulaRequest): Promise<AulaDetailResponse> {
  const response = await api.post<AulaDetailResponse>('/class', data)
  return response
}

export async function updateAula(id: number, data: UpdateAulaRequest): Promise<AulaDetailResponse> {
  const response = await api.put<AulaDetailResponse>(`/class/update/${id}`, data)
  return response
}

export async function deleteAula(id: number): Promise<void> {
  await api.delete(`/class/delete/${id}`)
}

export async function submitAulaFrequency(aulaId: number, data: SubmitFrequencyRequest): Promise<void> {
  await api.post(`/class/${aulaId}/frequency`, data)
}