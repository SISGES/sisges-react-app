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