import { describe, it, expect, vi, beforeEach } from 'vitest'
import { authorizeRole, requireAdmin, requireInstructor, requireStudent } from '../../src/middleware/role'

describe('Role-based Access Control Middleware', () => {
  let mockReq: Partial<Request>
  let mockRes: Partial<Response>
  let nextFn: NextFunction
  
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    username: 'testuser',
    firstName: 'Test',
    lastName: 'User',
    role: 'STUDENT' as const, // Default role for testing
    createdAt: new Date(),
    updatedAt: new Date()
  }

  beforeEach(() => {
    mockReq = {}
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    }
    nextFn = vi.fn()
    
    // Clear mocks
    vi.clearAllMocks()
  })

  describe('authorizeRole factory', () => {
    it('should allow user with matching single role', () => {
      // Arrange
      mockReq.user = { ...mockUser, role: 'STUDENT' }
      const middleware = authorizeRole('STUDENT')
      
      // Act
      middleware(
        mockReq as Request,
        mockRes as Response,
        nextFn
      )
      
      // Assert
      expect(nextFn).toHaveBeenCalled()
      expect(mockRes.status).not.toHaveBeenCalled()
    })

    it('should allow user with matching role from array', () => {
      // Arrange
      mockReq.user = { ...mockUser, role: 'INSTRUCTOR' }
      const middleware = authorizeRole(['STUDENT', 'INSTRUCTOR', 'ADMIN'])
      
      // Act
      middleware(
        mockReq as Request,
        mockRes as Response,
        nextFn
      )
      
      // Assert
      expect(nextFn).toHaveBeenCalled()
      expect(mockRes.status).not.toHaveBeenCalled()
    })

    it('should forbid user with non-matching role', () => {
      // Arrange
      mockReq.user = { ...mockUser, role: 'STUDENT' }
      const middleware = authorizeRole('ADMIN')
      
      // Act
      middleware(
        mockReq as Request,
        mockRes as Response,
        nextFn
      )
      
      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(403)
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Forbidden: Insufficient permissions',
          requiredRoles: ['ADMIN'],
          userRole: 'STUDENT'
        })
      )
      expect(nextFn).not.toHaveBeenCalled()
    })

    it('should handle multiple role arguments', () => {
      // Arrange
      mockReq.user = { ...mockUser, role: 'INSTRUCTOR' }
      const middleware = authorizeRole('STUDENT', 'INSTRUCTOR', 'ADMIN')
      
      // Act
      middleware(
        mockReq as Request,
        mockRes as Response,
        nextFn
      )
      
      // Assert
      expect(nextFn).toHaveBeenCalled()
      expect(mockRes.status).not.toHaveBeenCalled()
    })

    it('should return 401 when user not authenticated', () => {
      // Arrange
      // mockReq.user is undefined
      const middleware = authorizeRole('STUDENT')
      
      // Act
      middleware(
        mockReq as Request,
        mockRes as Response,
        nextFn
      )
      
      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(401)
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Unauthorized: User not authenticated' })
      expect(nextFn).not.toHaveBeenCalled()
    })
  })

  describe('convenience middleware functions', () => {
    it('requireAdmin should allow ADMIN role', () => {
      // Arrange
      mockReq.user = { ...mockUser, role: 'ADMIN' }
      
      // Act
      requireAdmin(
        mockReq as Request,
        mockRes as Response,
        nextFn
      )
      
      // Assert
      expect(nextFn).toHaveBeenCalled()
      expect(mockRes.status).not.toHaveBeenCalled()
    })

    it('requireAdmin should forbid non-ADMIN roles', () => {
      // Arrange
      mockReq.user = { ...mockUser, role: 'STUDENT' }
      
      // Act
      requireAdmin(
        mockReq as Request,
        mockRes as Response,
        nextFn
      )
      
      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(403)
      expect(nextFn).not.toHaveBeenCalled()
    })

    it('requireInstructor should allow INSTRUCTOR and ADMIN roles', () => {
      // Arrange for INSTRUCTOR
      mockReq.user = { ...mockUser, role: 'INSTRUCTOR' }
      
      // Act
      requireInstructor(
        mockReq as Request,
        mockRes as Response,
        nextFn
      )
      
      // Assert
      expect(nextFn).toHaveBeenCalled()
      expect(mockRes.status).not.toHaveBeenCalled()
      
      // Reset for ADMIN test
      mockReq.user = { ...mockUser, role: 'ADMIN' }
      nextFn.mockClear()
      
      // Act
      requireInstructor(
        mockReq as Request,
        mockRes as Response,
        nextFn
      )
      
      // Assert
      expect(nextFn).toHaveBeenCalled()
      expect(mockRes.status).not.toHaveBeenCalled()
    })

    it('requireInstructor should forbid STUDENT role', () => {
      // Arrange
      mockReq.user = { ...mockUser, role: 'STUDENT' }
      
      // Act
      requireInstructor(
        mockReq as Request,
        mockRes as Response,
        nextFn
      )
      
      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(403)
      expect(nextFn).not.toHaveBeenCalled()
    })

    it('requireStudent should allow all authenticated roles', () => {
      const roles = ['STUDENT', 'INSTRUCTOR', 'ADMIN']
      
      for (const role of roles) {
        // Arrange
        mockReq.user = { ...mockUser, role: role as const }
        nextFn.mockClear()
        
        // Act
        requireStudent(
          mockReq as Request,
          mockRes as Response,
          nextFn
        )
        
        // Assert
        expect(nextFn).toHaveBeenCalled()
        expect(mockRes.status).not.toHaveBeenCalled()
      }
    })
  })
})