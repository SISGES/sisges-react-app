export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expiresIn: number;
  name: string;
  email: string;
  register: string;
  role: string;
}

