import { Role } from './enums';

export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export interface RegisterDTO {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  password: string;
  role?: Role;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface MagicLoginDTO {
  email: string;
}

export interface Session {
  id: string;
  token: string;
  userId: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}