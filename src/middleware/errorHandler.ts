import { Request, Response, NextFunction } from 'express'

/**
 * Custom error class for operational errors
 */
export class AppError extends Error {
  public statusCode: number
  public isOperational: boolean

  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor)
  }
}

/**
 * Centralized Error Handling Middleware
 * Should be mounted as the last middleware in the chain
 */
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Set default values
  const statusCode = err.statusCode || err.status || 500
  const message = err.message || 'Internal Server Error'
  
  // Determine if it's an operational error (expected) or programming error
  const isOperational = err.isOperational || false

  // Log error for debugging
  console.error(`[${new Date().toISOString()}] Error:`, {
    message,
    statusCode,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    operational: isOperational
  })

  // In development, send more details
  const includeStack = process.env.NODE_ENV === 'development' && !isOperational

  // Send error response
  res.status(statusCode).json({
    error: {
      message,
      statusCode,
      ...(includeStack && { stack: err.stack })
    }
  })
}