import { Request, Response, NextFunction } from 'express'
import { User } from '../models'
import { CoursePolicy } from '../policies/CoursePolicy'
import { ModulePolicy } from '../policies/ModulePolicy'
import { SectionPolicy } from '../policies/SectionPolicy'
import { VideoMetadataPolicy } from '../policies/VideoMetadataPolicy'
import { ContentPolicy } from '../policies/ContentPolicy'
import { ProgressPolicy } from '../policies/ProgressPolicy'

// Type definitions
type PolicyFn = (user: User, resourceId: string) => Promise<boolean>

interface PolicyMap {
  [key: string]: PolicyFn
}

// Map policy prefixes to their preferred resource ID param (most specific first)
const POLICY_RESOURCE_PARAMS: Record<string, string[]> = {
  course: ['courseId', 'id'],
  module: ['moduleId', 'courseId', 'id'],
  section: ['sectionId', 'moduleId', 'courseId', 'id'],
  videoMetadata: ['videoMetadataId', 'sectionId', 'moduleId', 'courseId', 'id'],
  content: ['contentId', 'sectionId', 'moduleId', 'courseId', 'id'],
  progress: ['progressId', 'sectionId', 'userId', 'id'],
  user: ['userId', 'id'],
}

// Policy map that associates policy keys with their validation functions
const POLICIES: PolicyMap = {
  // Course policies
  'course:create': CoursePolicy.create,
  'course:read': CoursePolicy.read,
  'course:write': CoursePolicy.write,
  'course:update': CoursePolicy.update,
  'course:delete': CoursePolicy.delete,
  'course:maintain': CoursePolicy.maintain,

  // Module policies
  'module:read': ModulePolicy.read,
  'module:create': ModulePolicy.write, // create/update both use write permission
  'module:update': ModulePolicy.write,
  'module:delete': ModulePolicy.delete,

  // Section policies
  'section:read': SectionPolicy.read,
  'section:write': SectionPolicy.write,
  'section:create': SectionPolicy.write, // create/update both use write permission
  'section:update': SectionPolicy.write,
  'section:delete': SectionPolicy.delete,

  // VideoMetadata policies
  'videoMetadata:read': VideoMetadataPolicy.read,
  'videoMetadata:create': VideoMetadataPolicy.write,
  'videoMetadata:update': VideoMetadataPolicy.write,
  'videoMetadata:delete': VideoMetadataPolicy.delete,

  // Content policies
  'content:read': ContentPolicy.read,
  'content:create': ContentPolicy.write,
  'content:update': ContentPolicy.write,
  'content:delete': ContentPolicy.delete,

  // Progress policies
  'progress:read': ProgressPolicy.read,
  'progress:create': ProgressPolicy.write,
  'progress:update': ProgressPolicy.write,
  'progress:delete': ProgressPolicy.delete,
  // Section-specific progress policies (for /sections/:sectionId/progress endpoints)
  'progress:readBySection': ProgressPolicy.readBySection,
  'progress:writeBySection': ProgressPolicy.writeBySection,
  'progress:updateBySection': ProgressPolicy.updateBySection,
  'progress:deleteBySection': ProgressPolicy.deleteBySection,
}

export function authorizePolicy(policyKey: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get user from request (set by authenticateUser middleware)
      const user = (req as Request & { user?: User }).user
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      // Extract resource ID from params based on policy prefix
      // e.g., 'module:read' -> 'module' -> prefer moduleId over courseId
      const policyPrefix = policyKey.split(':')[0]
      const preferredParams = POLICY_RESOURCE_PARAMS[policyPrefix] || [
        'id',
        'courseId',
        'moduleId',
        'sectionId',
        'videoMetadataId',
        'contentId',
        'progressId',
        'userId',
      ]

      let resourceId: string | undefined
      for (const param of preferredParams) {
        const value = req.params[param]
        if (value) {
          resourceId = Array.isArray(value) ? value[0] : value
          break
        }
      }

      // Handle create operations where resource ID might not be in params
      if (policyKey.endsWith(':create')) {
        // For create operations, we need to check access to parent resource
        // For example, creating a module requires access to the course
        // Exception: course:create has no parent resource, check directly
        const parentIdMap: Record<string, string> = {
          'module:create': 'courseId',
          'section:create': 'moduleId',
          'videoMetadata:create': 'sectionId',
          'content:create': 'sectionId',
          'progress:create': 'sectionId', // or could be userId+sectionId combo
        }

        // Map create policies to their parent policies for authorization
        // e.g., module:create -> course:read (check read access to course)
        // For course:create, check course:create directly (no parent)
        const createPolicyMap: Record<string, string> = {
          'course:create': 'course:create',
          'module:create': 'course:write',
          'section:create': 'module:write',
          'videoMetadata:create': 'section:write',
          'content:create': 'section:write',
          'progress:create': 'progress:writeBySection',
        }

        // For course:create, no parent resource ID needed - policy doesn't require resourceId
        if (policyKey === 'course:create') {
          const policyFn = POLICIES['course:create']
          if (!policyFn) {
            return res.status(500).json({ error: 'Unknown policy' })
          }

          const allowed = await policyFn(user, '')
          if (!allowed) {
            return res.status(403).json({
              error: 'Forbidden: Insufficient permissions',
              requiredPolicy: policyKey,
              userRole: user.role,
              userId: user.id,
            })
          }

          return next()
        }

        const parentParam = parentIdMap[policyKey]
        if (parentParam && req.params[parentParam]) {
          const value = req.params[parentParam]
          resourceId = Array.isArray(value) ? value[0] : value
        } else {
          // Check body for parent ID
          const bodyValue = req.body[parentIdMap[policyKey]]
          resourceId = Array.isArray(bodyValue) ? bodyValue[0] : bodyValue
        }

        if (!resourceId) {
          return res.status(400).json({
            error: 'Missing resource ID for create operation',
            requiredPolicy: policyKey,
          })
        }

        // For create, check appropriate parent policy
        const parentPolicyKey =
          createPolicyMap[policyKey] || policyKey.replace(':create', ':read')
        const policyFn = POLICIES[parentPolicyKey]
        if (!policyFn) {
          return res.status(500).json({ error: 'Unknown policy' })
        }

        const allowed = await policyFn(user, resourceId)
        if (!allowed) {
          return res.status(403).json({
            error: 'Forbidden: Insufficient permissions',
            requiredPolicy: policyKey,
            userRole: user.role,
            userId: user.id,
          })
        }

        return next()
      }

      // For non-create operations, validate the policy directly
      const policyFn = POLICIES[policyKey]
      if (!policyFn) {
        return res.status(500).json({ error: 'Unknown policy' })
      }

      // If we don't have a resource ID, we can't check the policy
      if (!resourceId) {
        return res.status(400).json({
          error: 'Missing resource ID',
          requiredPolicy: policyKey,
        })
      }

      const allowed = await policyFn(user, resourceId)
      if (!allowed) {
        return res.status(403).json({
          error: 'Forbidden: Insufficient permissions',
          requiredPolicy: policyKey,
          userRole: user.role,
          userId: user.id,
        })
      }

      next()
    } catch (error) {
      console.error('Authorization error:', error)
      return res
        .status(500)
        .json({ error: 'Internal server error during authorization' })
    }
  }
}
