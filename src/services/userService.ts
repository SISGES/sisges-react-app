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

export async function addDisciplineToClass(classId: number, disciplineId: number): Promise<ClassDetailResponse> {
  const response = await api.post<ClassDetailResponse>(`/classes/${classId}/discipline/add/${disciplineId}`)
  return response
}

export async function removeDisciplineFromClass(classId: number, disciplineId: number): Promise<ClassDetailResponse> {
  const response = await api.post<ClassDetailResponse>(`/classes/${classId}/discipline/remove/${disciplineId}`)
  return response
}