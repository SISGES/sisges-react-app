import { api } from './api';
import type { LoginRequest, LoginResponse, UpdateUserRequest, UpdateUserResponse } from '../types/auth';
import { storage } from '../utils/localStorage';

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    const { token, expiresIn, userResponse, role } = response.data;
    const { id, name, email, register } = userResponse;
    
    storage.setAuthData(id.toString(), token, expiresIn, name, email, register, role);
    
    return response.data;
  },

  updateUser: async (userId: string, data: UpdateUserRequest): Promise<UpdateUserResponse> => {
    try {
      const response = await api.put<UpdateUserResponse>(`/user/update/${userId}`, data);
      const userResponse = response.data;
      
      const existingToken = storage.getToken();
      const existingExpiresIn = storage.getExpiresIn();
      const existingRole = storage.getRole();
      
      if (!existingToken || !existingExpiresIn || !existingRole) {
        throw new Error('Dados de autenticação não encontrados');
      }
      
      const { id, name, email, register } = userResponse;
      storage.setAuthData(
        id.toString(),
        existingToken,
        existingExpiresIn,
        name,
        email,
        register,
        existingRole
      );
      
      return userResponse;
    } catch (error: any) {
      console.error('Error in updateUser:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },
};
