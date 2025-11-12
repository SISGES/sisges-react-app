export interface SearchUserRequest {
  name?: string;
  email?: string;
  register?: string;
  initialBirthDate?: string;
  finalBirthDate?: string;
  gender?: 'F' | 'M' | 'O';
  page?: number;
  size?: number;
}

export interface RegisterUserRequest {
  name: string;
  email: string;
  password: string;
  birthDate: string;
  gender: 'F' | 'M' | 'O';
  userRole: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  gender: string;
  birthDate: string;
  register: string;
  userRole?: string;
}

export interface PaginatedUserResponse {
  content: User[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

