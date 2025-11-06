import { api } from './api';
import type { LoginRequest, LoginResponse } from '../types/auth';
import { storage } from '../utils/localStorage';

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    const { token, expiresIn, name, email, register, role } = response.data;
    
    storage.setAuthData(token, expiresIn, name, email, register, role);
    
    return response.data;
  },
};

