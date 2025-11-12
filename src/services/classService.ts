import { api } from './api';
import type { StudentResponse, SchoolClassResponse, TeacherClassesResponse, CreateClassRequest, ClassDetailResponse, SearchClassRequest, PaginatedClassResponse, DetailedSchoolClassResponse } from '../types/class';

export const classService = {
  getTeacherClassesByUserId: async (userId: string): Promise<SchoolClassResponse[]> => {
    const response = await api.get<TeacherClassesResponse>(`/teacher/user/${userId}`);
    return Array.isArray(response.data?.classes) ? response.data.classes : [];
  },

  getStudentIdByUserId: async (userId: string): Promise<number> => {
    const response = await api.get<{ id: number }>(`/student/user/${userId}`);
    return response.data.id;
  },

  getStudent: async (studentId: string): Promise<StudentResponse> => {
    const response = await api.get<StudentResponse>(`/student/${studentId}`);
    return response.data;
  },

  searchClasses: async (filters?: SearchClassRequest): Promise<PaginatedClassResponse> => {
    const requestBody: SearchClassRequest = {
      page: filters?.page ?? 0,
      size: filters?.size ?? 20,
    };
    
    if (filters) {
      if (filters.fromDate) requestBody.fromDate = filters.fromDate;
      if (filters.toDate) requestBody.toDate = filters.toDate;
      if (filters.name) requestBody.name = filters.name;
    }
    
    const response = await api.post<PaginatedClassResponse>('/class/search', requestBody);
    return response.data;
  },

  getClassById: async (classId: number): Promise<DetailedSchoolClassResponse> => {
    const response = await api.get<DetailedSchoolClassResponse>(`/class/${classId}`);
    return response.data;
  },

  createClass: async (data: CreateClassRequest): Promise<SchoolClassResponse> => {
    const response = await api.post<SchoolClassResponse>('/class/create', data);
    return response.data;
  },

  linkTeacherToClass: async (classId: number, teacherId: number): Promise<SchoolClassResponse> => {
    const response = await api.post<SchoolClassResponse>(`/class/${classId}/bind/teacher/${teacherId}`);
    return response.data;
  },

  unlinkTeacherFromClass: async (classId: number, teacherId: number): Promise<void> => {
    await api.post(`/class/${classId}/unbind/teacher/${teacherId}`);
  },

  linkStudentToClass: async (classId: number, studentId: number): Promise<void> => {
    await api.post(`/class/${classId}/student/${studentId}`);
  },

  unlinkStudentFromClass: async (classId: number, studentId: number): Promise<void> => {
    await api.delete(`/class/${classId}/student/${studentId}`);
  },

  getStudentCurrentClass: async (studentId: number): Promise<SchoolClassResponse | null> => {
    try {
      const response = await api.get<{ classEntity: SchoolClassResponse }>(`/student/${studentId}/class`);
      return response.data?.classEntity || null;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },
};

