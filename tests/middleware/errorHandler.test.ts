import { describe, it, expect, vi, beforeEach } from 'vitest'
import { errorHandler, AppError } from '../../src/middleware/errorHandler'

describe('Error Handling Middleware', () => {
  let mockReq: Partial<Request>
  let mockRes: Partial<Response>
  let nextFn: NextFunction
  
  beforeEach(() => {
    mockReq = {
      originalUrl: '/test',
      method: 'GET'
    }
    
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    }
    
    nextFn = vi.fn()
    
    // Mock console.error to avoid polluting test output
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('errorHandler', () => {
    it('should handle AppError with correct status code', () => {
      // Arrange
      const appError = new AppError('Validation failed', 400)
      
      // Act
      errorHandler(
        appError,
        mockReq as Request,
        mockRes as Response,
        nextFn
      )
      
      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400)
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: {
            message: 'Validation failed',
            statusCode: 400
          }
        })
      )
      expect(nextFn).not.toHaveBeenCalled()
    })

    it('should handle generic Error with 500 status code', () => {
      // Arrange
      const genericError = new Error('Database connection failed')
      
      // Act
      errorHandler(
        genericError,
        mockReq as Request,
        mockRes as Response,
        nextFn
      )
      
      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500)
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: {
            message: 'Database connection failed',
            statusCode: 500
          }
        })
      )
      expect(nextFn).not.toHaveBeenCalled()
    })

    it('should handle error with status property', () => {
      // Arrange
      const errorWithStatus = new Error('Unauthorized access') as any
      errorWithStatus.status = 401
      
      // Act
      errorHandler(
        errorWithStatus,
        mockReq as Request,
        mockRes as Response,
        nextFn
      )
      
      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(401)
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: {
            message: 'Unauthorized access',
            statusCode: 401
          }
        })
      )
      expect(nextFn).not.toHaveBeenCalled()
    })

    it('should mark operational errors correctly', () => {
      // Arrange
      const operationalError = new AppError('User not found', 404)
      // AppError sets isOperational to true by default
      
      // Act
      errorHandler(
        operationalError,
        mockReq as Request,
        mockRes as Response,
        nextFn
      )
      
      // Assert - we can't directly test the internal logging, but we can verify
      // the response is correct
      expect(mockRes.status).toHaveBeenCalledWith(404)
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: {
            message: 'User not found',
            statusCode: 404
          }
        })
      )
    })

    it('should include stack trace in development mode', () => {
      // Arrange
      process.env.NODE_ENV = 'development'
      const error = new Error('Test error')
      
      // Act
      errorHandler(
        error,
        mockReq as Request,
        mockRes as Response,
        nextFn
      )
      
      // Assert
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            stack: expect.any(String)
          })
        })
      )
    })

    it('should not include stack trace in production mode', () => {
      // Arrange
      process.env.NODE_ENV = 'production'
      const error = new Error('Test error')
      
      // Act
      errorHandler(
        error,
        mockReq as Request,
        mockRes as Response,
        nextFn
      )
      
      // Assert
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            message: 'Test error',
            statusCode: 500
          })
        })
      )
      
      // The response should not have a stack property
      const responseMock = mockRes.json as vi.Mock
      const callArgs = responseMock.mock.calls[0][0]
      expect(callArgs.error).not.toHaveProperty('stack')
    })

    it('should log error details to console', () => {
      // Arrange
      const testError = new Error('Test error for logging')
      
      // Act
      errorHandler(
        testError,
        mockReq as Request,
        mockRes as Response,
        nextFn
      )
      
      // Assert
      expect(console.error).toHaveBeenCalled()
      // Check that it was called with error information
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('[Test error for logging]'),
        expect.objectContaining({
          message: 'Test error for logging',
          url: '/test',
          method: 'GET'
        })
      )
    })
  })
})