import { z } from 'zod';
import { RegisterDTO, LoginDTO, MagicLoginDTO } from '../types';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters long'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  role: z.nativeEnum(z.ZodTypeAny).optional().default('STUDENT'), // We'll adjust this to use the Role enum
});

// Since we cannot directly import the TypeScript enum in zod's nativeEnum without a workaround,
// we can create a zod enum from the Role enum values.
// Alternatively, we can define the enum in zod and then use it.
// Let's create a zod enum for Role.

// We'll import the Role enum from ../types/enums
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