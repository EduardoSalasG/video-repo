import { Request, Response } from 'express';
import prisma from '../config/database';
import { registerSchema, loginSchema, magicLoginSchema } from '../validators/authValidators';
import { hashPassword, verifyPassword } from '../utils/password';
import { generateToken } from '../utils/token';
import { z } from 'zod';
import { randomUUID } from 'crypto';

/**
 * Return the currently authenticated user.
 * `authenticateUser` middleware attaches `req.user`.
 */
export async function getCurrentUser(req: Request, res: Response): Promise<void> {
  res.status(200).json({ user: (req as any).user });
}

function isZodError(error: unknown): error is z.ZodError {
  return error instanceof z.ZodError;
}

function zodErrorDetails(error: z.ZodError): unknown {
  return (error as z.ZodError & { issues?: unknown }).issues ??
    (error as z.ZodError & { errors?: unknown }).errors;
}

/**
 * Register a new user
 */
export async function register(req: Request, res: Response): Promise<void> {
  try {
    // Validate request body
    const parsedBody = registerSchema.parse(req.body);

    // Check if user already exists by email or username
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: parsedBody.email },
          { username: parsedBody.username },
        ],
      },
    });

    if (existingUser) {
      res.status(409).json({ error: 'User with this email or username already exists' });
      return;
    }

    // Hash password
    const passwordHash = await hashPassword(parsedBody.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: parsedBody.email,
        username: parsedBody.username,
        firstName: parsedBody.firstName,
        lastName: parsedBody.lastName,
        passwordHash,
        role: parsedBody.role || 'STUDENT',
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-for-development-only';
    const accessToken = generateToken({ userId: user.id }, jwtSecret, '1h');

    // Return response
    res.status(201).json({
      accessToken,
      user,
    });
  } catch (error) {
    console.error('Validation error in register:', error);
    if (isZodError(error)) {
      res.status(400).json({ error: zodErrorDetails(error) });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

/**
 * Login user
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    // Validate request body
    const parsedBody = loginSchema.parse(req.body);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: parsedBody.email },
    });

    if (!user) {
      // Return generic error to avoid leaking whether the email exists
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Verify password
    const isValidPassword = await verifyPassword(parsedBody.password, user.passwordHash);
    if (!isValidPassword) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Generate JWT token (1 hour expiry)
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-for-development-only';
    const accessToken = generateToken({ userId: user.id }, jwtSecret, '1h');

    // Set the httpOnly cookie that the frontend reads
    res.cookie('video_repo_token', accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 1000, // 1 hour – matches token expiry
    });

    // Return user data (without passwordHash) – optional, but kept for compatibility
    const userWithoutPassword = { ...user } as Record<string, unknown>;
    delete userWithoutPassword.passwordHash;

    res.json({
      accessToken,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Validation error in login:', error);
    if (isZodError(error)) {
      res.status(400).json({ error: zodErrorDetails(error) });
    } else {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

/**
 * Magic link authentication - send magic link to email
 */
export async function magicLink(req: Request, res: Response): Promise<void> {
  try {
    // Validate request body
    const parsedBody = magicLoginSchema.parse(req.body);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: parsedBody.email },
    });

    // For security, we always return the same message regardless of whether the user exists
    // to prevent email enumeration.
    if (!user) {
      res.json({ message: 'If the email exists, a magic link has been sent.' });
      return;
    }

    // Generate a magic link token (we'll use a random UUID for simplicity)
    // In a production app, you might want to use a cryptographically random string.
    const token = randomUUID();

    // Set expiration to 1 hour from now
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // Create session record
    await prisma.session.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    // In a real application, we would send an email with a link like:
    // `https://yourapp.com/auth/verify-magic-link?token=${token}`
    // For this exercise, we'll just return a success message.
    // Optionally, for development, we could return the token in the response.
    // But we'll stick to not leaking the token.
    res.json({ message: 'If the email exists, a magic link has been sent.' });
  } catch (error) {
    console.error('Validation error in magicLink:', error);
    if (isZodError(error)) {
      res.status(400).json({ error: zodErrorDetails(error) });
    } else {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}