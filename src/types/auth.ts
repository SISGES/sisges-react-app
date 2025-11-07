import type { UserRoleEnum } from '../enums/UserRoleEnum';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  gender: string;
  birthDate: string;
  register: string;
}

export interface LoginResponse {
  token: string;
  expiresIn: number;
  userResponse: UserResponse;
  role: UserRoleEnum;
}

export interface UpdateUserRequest {
  name: string;
  password: string;
  birthDate: string;
  gender: 'M' | 'F' | 'O';
}

export type UpdateUserResponse = UserResponse;

