import api from './api'
import type { UserResponse } from '../types/auth'

export type { UserResponse }

// Busca todos os usuários cadastrados (endpoint protegido para ADMIN)
export async function getUsers(): Promise<UserResponse[]> {
  const response = await api.get<UserResponse[]>('/users')
  return response
}
