import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { authenticateUser } from '../../src/middleware/auth'
import { verifyToken } from '../../src/utils/token'
import prisma from '../../src/config/database'

// Mock dependencies
vi.mock('../../src/utils/token')
vi.mock('../../src/config/database', () => {
  return {
    default: {
      user: {
        findUnique: vi.fn()
      }
    }
  }
})

describe('Authentication Middleware', () => {
  let mockReq: Partial<Request>
  let mockRes: Partial<Response>
  let nextFn: NextFunction
  
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    username: 'testuser',
    firstName: 'Test',
    lastName: 'User',
    role: 'STUDENT' as const,
    createdAt: new Date(),
    updatedAt: new Date()
  }

  beforeEach(() => {
    mockReq = {
      headers: {}
    }
    
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    }
    
    nextFn = vi.fn()
    
    // Clear mocks
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('authenticateUser', () => {
    it('should call next with valid token and user', async () => {
      // Arrange
      const token = 'valid-jwt-token'
      mockReq.headers = { authorization: `Bearer ${token}` }
      
      const payload = { userId: 'test-user-id' }
      ;(verifyToken as vi.Mock).mockReturnValue(payload)
      
      ;(prisma.user.findUnique as vi.Mock).mockResolvedValue(mockUser)
      
      // Act
      await authenticateUser(
        mockReq as Request,
        mockRes as Response,
        nextFn
      )
      
      // Assert
      expect(verifyToken).toHaveBeenCalledWith(token, expect.any(String))
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-user-id' },
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true,
          updatedAt: true
        }
      })
      expect(nextFn).toHaveBeenCalled()
      expect(mockRes.status).not.toHaveBeenCalled()
    })

    it('should return 401 when no authorization header', async () => {
      // Arrange
      mockReq.headers = {}
      
      // Act
      await authenticateUser(
        mockReq as Request,
        mockRes as Response,
        nextFn
      )
      
      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(401)
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Unauthorized: No token provided' })
      expect(nextFn).not.toHaveBeenCalled()
    })

    it('should return 401 when malformed authorization header', async () => {
      // Arrange
      mockReq.headers = { authorization: 'InvalidTokenFormat' }
      
      // Act
      await authenticateUser(
        mockReq as Request,
        mockRes as Response,
        nextFn
      )
      
      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(401)
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Unauthorized: No token provided' })
      expect(nextFn).not.toHaveBeenCalled()
    })

    it('should return 401 when token verification fails', async () => {
      // Arrange
      const token = 'invalid-token'
      mockReq.headers = { authorization: `Bearer ${token}` }
      
      // Mock verifyToken to throw
      ;(verifyToken as vi.Mock).mockImplementation(() => {
        throw new Error('Invalid token')
      })
      
      // Act
      await authenticateUser(
        mockReq as Request,
        mockRes as Response,
        nextFn
      )
      
      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(401)
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Unauthorized: Invalid token' })
      expect(nextFn).not.toHaveBeenCalled()
    })

    it('should return 401 when token is expired', async () => {
      // Arrange
      const token = 'expired-token'
      mockReq.headers = { authorization: `Bearer ${token}` }
      
      // Mock verifyToken to throw TokenExpiredError
      const tokenExpiredError = new Error('Token expired') as any
      tokenExpiredError.name = 'TokenExpiredError'
      ;(verifyToken as vi.Mock).mockImplementation(() => {
        throw tokenExpiredError
      })
      
      // Act
      await authenticateUser(
        mockReq as Request,
        mockRes as Response,
        nextFn
      )
      
      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(401)
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Unauthorized: Token expired' })
      expect(nextFn).not.toHaveBeenCalled()
    })

    it('should return 401 when user not found in database', async () => {
      // Arrange
      const token = 'valid-token'
      mockReq.headers = { authorization: `Bearer ${token}` }
      
      const payload = { userId: 'non-existent-user' }
      ;(verifyToken as vi.Mock).mockReturnValue(payload)
      
      ;(prisma.user.findUnique as vi.Mock).mockResolvedValue(null)
      
      // Act
      await authenticateUser(
        mockReq as Request,
        mockRes as Response,
        nextFn
      )
      
      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(401)
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Unauthorized: User not found' })
      expect(nextFn).not.toHaveBeenCalled()
    })

    it('should return 401 when token payload missing userId', async () => {
      // Arrange
      const token = 'valid-token'
      mockReq.headers = { authorization: `Bearer ${token}` }
      
      const payload = { someOtherField: 'value' } // No userId
      ;(verifyToken as vi.Mock).mockReturnValue(payload)
      
      // Act
      await authenticateUser(
        mockReq as Request,
        mockRes as Response,
        nextFn
      )
      
      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(401)
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Unauthorized: Invalid token payload' })
      expect(nextFn).not.toHaveBeenCalled()
    })
  })
})