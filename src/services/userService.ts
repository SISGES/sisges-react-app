import { api } from './api';
import type { SearchUserRequest, RegisterUserRequest, PaginatedUserResponse, User } from '../types/user';
import type { UserResponse, UpdateUserRequest, UpdateUserResponse } from '../types/auth';
import type { SearchTeacherRequest, PaginatedTeacherResponse, SearchStudentRequest, PaginatedStudentResponse } from '../types/class';

export const userService = {
  searchUsers: async (filters?: SearchUserRequest): Promise<PaginatedUserResponse> => {
    const requestBody: SearchUserRequest = {
      page: filters?.page ?? 0,
      size: filters?.size ?? 20,
    };
    
    if (filters) {
      if (filters.name) requestBody.name = filters.name;
      if (filters.email) requestBody.email = filters.email;
      if (filters.register) requestBody.register = filters.register;
      if (filters.initialBirthDate) requestBody.initialBirthDate = filters.initialBirthDate;
      if (filters.finalBirthDate) requestBody.finalBirthDate = filters.finalBirthDate;
      if (filters.gender) requestBody.gender = filters.gender;
    }
    
    const response = await api.post<PaginatedUserResponse>('/user', requestBody);
    return response.data;
  },

  registerUser: async (userData: RegisterUserRequest): Promise<UserResponse> => {
    const response = await api.post<UserResponse>('/auth/register', userData);
    return response.data;
  },

  updateUser: async (userId: string, data: UpdateUserRequest): Promise<UpdateUserResponse> => {
    const response = await api.put<UpdateUserResponse>(`/user/update/${userId}`, data);
    return response.data;
  },

  getAllTeachers: async (): Promise<User[]> => {
    const response = await api.get<User[]>('/teachers');
    return response.data || [];
  },

  getAllStudents: async (): Promise<User[]> => {
    const response = await api.get<User[]>('/students');
    return response.data || [];
  },

  searchTeachers: async (filters?: SearchTeacherRequest): Promise<PaginatedTeacherResponse> => {
    const hasSearchFilters = filters && (
      filters.fromDate || 
      filters.toDate || 
      filters.register || 
      filters.name || 
      filters.email
    );
    
    if (!hasSearchFilters) {
      const response = await api.post<PaginatedTeacherResponse>('/teacher/search', {});
      return response.data;
    }
    
    const requestBody: SearchTeacherRequest = {};
    
    if (filters.page !== undefined) requestBody.page = filters.page;
    if (filters.size !== undefined) requestBody.size = filters.size;
    
    if (filters.fromDate) requestBody.fromDate = filters.fromDate;
    if (filters.toDate) requestBody.toDate = filters.toDate;
    if (filters.register) requestBody.register = filters.register;
    if (filters.name) requestBody.name = filters.name;
    if (filters.email) requestBody.email = filters.email;
    
    const response = await api.post<PaginatedTeacherResponse>('/teacher/search', requestBody);
    return response.data;
  },

  searchStudents: async (filters?: SearchStudentRequest): Promise<PaginatedStudentResponse> => {
    const hasSearchFilters = filters && (
      filters.fromDate || 
      filters.toDate || 
      filters.register || 
      filters.name || 
      filters.responsibleName ||
      filters.email
    );
    
    if (!hasSearchFilters) {
      const response = await api.post<PaginatedStudentResponse>('/student/search', {});
      return response.data;
    }
    
    const requestBody: SearchStudentRequest = {};
    
    if (filters.page !== undefined) requestBody.page = filters.page;
    if (filters.size !== undefined) requestBody.size = filters.size;
    
    if (filters.fromDate) requestBody.fromDate = filters.fromDate;
    if (filters.toDate) requestBody.toDate = filters.toDate;
    if (filters.register) requestBody.register = filters.register;
    if (filters.name) requestBody.name = filters.name;
    if (filters.responsibleName) requestBody.responsibleName = filters.responsibleName;
    if (filters.email) requestBody.email = filters.email;
    
    const response = await api.post<PaginatedStudentResponse>('/student/search', requestBody);
    return response.data;
  },
};

