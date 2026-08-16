import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../utils/token'
import prisma from '../config/database'

/**
 * JWT Authentication Middleware
 * Verifies JWT token and attaches user to request
 */
export async function authenticateUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization
    
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized: No token provided' })
      return
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix
    
    if (!token) {
      res.status(401).json({ error: 'Unauthorized: No token provided' })
      return
    }

    // Verify token
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-for-development-only'
    const payload = verifyToken(token, jwtSecret)
    
    // Attach user info to request
    // Assuming payload contains userId from token generation
    const userId = typeof payload === 'object' && payload !== null && 'userId' in payload 
      ? (payload as { userId: string }).userId 
      : undefined

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized: Invalid token payload' })
      return
    }

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
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

    if (!user) {
      res.status(401).json({ error: 'Unauthorized: User not found' })
      return
    }

    // Attach user to request object
    ;(req as any).user = user
    
    next()
  } catch (error) {
    // Handle token verification errors
    const err = error as { name?: string }
    if (err.name === 'JsonWebTokenError') {
      res.status(401).json({ error: 'Unauthorized: Invalid token' })
    } else if (err.name === 'TokenExpiredError') {
      res.status(401).json({ error: 'Unauthorized: Token expired' })
    } else {
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}