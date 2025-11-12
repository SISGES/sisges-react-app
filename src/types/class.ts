export interface SchoolClassResponse {
  id: number;
  name: string;
  teacherCount?: number;
  studentCount: number;
  createdAt: string;
}

export interface StudentResponse {
  id: number;
  name: string;
  email: string;
  register?: string;
  classEntity?: SchoolClassResponse;
}

export interface TeacherClassesResponse {
  classes: SchoolClassResponse[];
}

export interface CreateClassRequest {
  name: string;
}

export interface SearchClassRequest {
  fromDate?: string;
  toDate?: string;
  name?: string;
  page?: number;
  size?: number;
}

export interface PaginatedClassResponse {
  content: SchoolClassResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface SearchTeacherRequest {
  fromDate?: string;
  toDate?: string;
  register?: string;
  name?: string;
  email?: string;
  page?: number;
  size?: number;
}

export interface TeacherResponse {
  id: number;
  userId: number;
  name: string;
  email: string;
  classes: SchoolClassResponse[];
}

export interface PaginatedTeacherResponse {
  content: TeacherResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface DetailedSchoolClassResponse {
  name: string;
  teachers: TeacherResponse[];
  students: StudentResponse[];
  createdAt: string;
}

export interface ClassDetailResponse {
  id: number;
  name: string;
  studentCount: number;
  createdAt: string;
  teachers: TeacherInfo[];
  students: StudentInfo[];
}

export interface TeacherInfo {
  id: number;
  name: string;
  email: string;
}

export interface StudentInfo {
  id: number;
  name: string;
  email: string;
  register: string;
}
