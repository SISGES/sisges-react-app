import { api } from './api';
import type { StudentResponse, TeacherResponse } from '../types/class';

export const classService = {
  getStudent: async (studentId: string): Promise<StudentResponse> => {
    const response = await api.get<StudentResponse>(`/student/${studentId}`);
    return response.data;
  },

  getTeacher: async (teacherId: string): Promise<TeacherResponse> => {
    const response = await api.get<TeacherResponse>(`/teacher/${teacherId}`);
    return response.data;
  },
};

