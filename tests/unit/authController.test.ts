import { register, login, magicLink } from '../src/controllers/authController';
import { registerSchema, loginSchema, magicLoginSchema } from '../src/validators/authValidators';
import { hashPassword, verifyPassword } from '../src/utils/password';
import { generateToken } from '../src/utils/token';
import { Role } from '../src/types/enums';
import { User } from '../src/types';

// Mock prisma
vi.mock('../config/database', () => {
  return {
    default: {
      user: {
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
      },
      session: {
        create: vi.fn(),
      },
    },
  };
});

// Mock password utils
vi.mock('../src/utils/password', () => {
  return {
    hashPassword: vi.fn(),
    verifyPassword: vi.fn(),
  };
});

// Mock token utils
vi.mock('../src/utils/token', () => {
  return {
    generateToken: vi.fn(),
    verifyToken: vi.fn(),
  };
});

import prisma from '../config/database';
import { hashPassword as hashPasswordMock, verifyPassword as verifyPasswordMock } from '../src/utils/password';
import { generateToken as generateTokenMock } from '../src/utils/token';

describe('authController', () => {
  let mockReq: any;
  let mockRes: any;

  beforeEach(() => {
    mockReq = { body: {} };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    vi.clearAllMocks();
  });

  describe('register', () => {
    const validUser = {
      email: 'test@example.com',
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      password: 'password123',
      role: Role.STUDENT as const,
    };

    it('should register a new user successfully', async () => {
      mockReq.body = validUser;
      // Mock prisma.findFirst to return null (no existing user)
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);
      // Mock hashPassword to return a hashed password
      (hashPasswordMock as jest.Mock).mockResolvedValue('hashedpassword');
      // Mock prisma.create to return the created user (without passwordHash)
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: '1',
        email: validUser.email,
        username: validUser.username,
        firstName: validUser.firstName,
        lastName: validUser.lastName,
        role: validUser.role,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      // Mock generateToken to return a fake token
      (generateTokenMock as jest.Mock).mockReturnValue('faketoken');

      await register(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        accessToken: 'faketoken',
        user: {
          id: '1',
          email: validUser.email,
          username: validUser.username,
          firstName: validUser.firstName,
          lastName: validUser.lastName,
          role: validUser.role,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      });
    });

    it('should return 409 if user with email already exists', async () => {
      mockReq.body = validUser;
      // Mock prisma.findFirst to return an existing user
      (prisma.user.findFirst as jest.Mock).mockResolvedValue({ id: '1', email: validUser.email });

      await register(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'User with this email or username already exists',
      });
    });

    it('should return 400 if validation fails', async () => {
      mockReq.body = { ...validUser, email: 'invalid-email' };

      await register(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ message: expect.stringContaining('email') }),
        ])
      );
    });
  });

  describe('login', () => {
    const validLogin = {
      email: 'test@example.com',
      password: 'password123',
    };
    const existingUser = {
      id: '1',
      email: validLogin.email,
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      passwordHash: 'hashedpassword',
      role: Role.STUDENT,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should login a user with valid credentials', async () => {
      mockReq.body = validLogin;
      // Mock prisma.findUnique to return the existing user
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(existingUser);
      // Mock verifyPassword to return true
      (verifyPasswordMock as jest.Mock).mockResolvedValue(true);
      // Mock generateToken to return a fake token
      (generateTokenMock as jest.Mock).mockReturnValue('faketoken');

      await login(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        accessToken: 'faketoken',
        user: {
          id: existingUser.id,
          email: existingUser.email,
          username: existingUser.username,
          firstName: existingUser.firstName,
          lastName: existingUser.lastName,
          role: existingUser.role,
          createdAt: existingUser.createdAt,
          updatedAt: existingUser.updatedAt,
        },
      });
    });

    it('should return 401 for invalid email', async () => {
      mockReq.body = validLogin;
      // Mock prisma.findUnique to return null (user not found)
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid email or password',
      });
    });

    it('should return 401 for invalid password', async () => {
      mockReq.body = validLogin;
      // Mock prisma.findUnique to return the existing user
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(existingUser);
      // Mock verifyPassword to return false
      (verifyPasswordMock as jest.Mock).mockResolvedValue(false);

      await login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid email or password',
      });
    });

    it('should return 400 if validation fails', async () => {
      mockReq.body = { ...validLogin, email: 'invalid-email' };

      await login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ message: expect.stringContaining('email') }),
        ])
      );
    });
  });

  describe('magicLink', () => {
    const magicLogin = {
      email: 'test@example.com',
    };
    const existingUser = {
      id: '1',
      email: magicLogin.email,
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      role: Role.STUDENT,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should return success message when user exists', async () => {
      mockReq.body = magicLogin;
      // Mock prisma.findUnique to return the existing user
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(existingUser);
      // Mock prisma.session.create to resolve
      (prisma.session.create as jest.Mock).mockResolvedValue({});

      await magicLink(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'If the email exists, a magic link has been sent.',
      });
      expect(prisma.session.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: existingUser.id,
          token: expect.any(String),
          expiresAt: expect.any(Date),
        })
      );
    });

    it('should return success message when user does not exist (to prevent email enumeration)', async () => {
      mockReq.body = magicLogin;
      // Mock prisma.findUnique to return null (user not found)
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await magicLink(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'If the email exists, a magic link has been sent.',
      });
      expect(prisma.session.create).not.toHaveBeenCalled();
    });

    it('should return 400 if validation fails', async () => {
      mockReq.body = { ...magicLogin, email: 'invalid-email' };

      await magicLink(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ message: expect.stringContaining('email') }),
        ])
      );
    });
  });
});