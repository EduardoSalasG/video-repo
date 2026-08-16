import { z } from 'zod';
import { Role } from '../types/enums';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters long'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  role: z.enum([Role.ADMIN, Role.INSTRUCTOR, Role.STUDENT]).optional().default(Role.STUDENT),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const magicLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
});