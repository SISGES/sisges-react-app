import api from './api'
import type { UserResponse, UserSearchFilters } from '../types/auth'

export type { UserResponse, UserSearchFilters }

export async function searchUsers(filters?: UserSearchFilters): Promise<UserResponse[]> {
  const response = await api.post<UserResponse[]>('/users/search', filters)
  return response
}

export async function getUserById(id: number): Promise<UserResponse> {
  const response = await api.get<UserResponse>(`/users/${id}`)
  return response
}

export async function getUsers(): Promise<UserResponse[]> {
  return searchUsers()
}
