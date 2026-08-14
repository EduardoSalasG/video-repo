import { Request, Response, NextFunction } from 'express'

/**
 * Role-based Access Control Middleware
 * Factory function that returns middleware checking user role(s)
 * @param allowedRoles - Single role or array of roles allowed to access the route
 */
export function authorizeRole(...allowedRoles: (string | string[])[]) {
  // Flatten the allowedRoles array in case arrays were passed
  const rolesArray = allowedRoles.flat()

  return function (req: Request, res: Response, next: NextFunction): void {
    try {
      // Get user from request (set by authenticateUser middleware)
      const user = (req as any).user
      
      if (!user) {
        res.status(401).json({ error: 'Unauthorized: User not authenticated' })
        return
      }

      // Check if user has required role
      const userRole = user.role
      const hasRole = rolesArray.includes(userRole)

      if (!hasRole) {
        res.status(403).json({ 
          error: 'Forbidden: Insufficient permissions', 
          requiredRoles: rolesArray,
          userRole 
        })
        return
      }

      // User has required role, proceed to next middleware
      next()
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}

// Convenience middleware for specific roles
export const requireAdmin = authorizeRole('ADMIN')
export const requireInstructor = authorizeRole('INSTRUCTOR', 'ADMIN') // Instructors and admins can access
export const requireStudent = authorizeRole('STUDENT', 'INSTRUCTOR', 'ADMIN') // All authenticated users