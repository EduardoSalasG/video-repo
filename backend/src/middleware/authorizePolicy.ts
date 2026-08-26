import { Request, Response, NextFunction } from 'express';
import { User } from '../models';
import { CoursePolicy } from './policies/CoursePolicy';
import { ModulePolicy } from './policies/ModulePolicy';
import { SectionPolicy } from './policies/SectionPolicy';
import { VideoMetadataPolicy } from './policies/VideoMetadataPolicy';
import { ContentPolicy } from './policies/ContentPolicy';
import { ProgressPolicy } from './policies/ProgressPolicy';

// Type definitions
type PolicyFn = (user: User, resourceId: string) => Promise<boolean>;

interface PolicyMap {
  [key: string]: PolicyFn;
}

// Policy map that associates policy keys with their validation functions
const POLICIES: PolicyMap = {
  // Course policies
  'course:create': CoursePolicy.create,
  'course:read': CoursePolicy.read,
  'course:update': CoursePolicy.update,
  'course:delete': CoursePolicy.delete,
  'course:maintain': CoursePolicy.maintain,

  // Module policies
  'module:read': ModulePolicy.read,
  'module:create': ModulePolicy.write,    // create/update both use write permission
  'module:update': ModulePolicy.write,
  'module:delete': ModulePolicy.delete,

  // Section policies
  'section:read': SectionPolicy.read,
  'section:create': SectionPolicy.write,  // create/update both use write permission
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
};

export function authorizePolicy(policyKey: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get user from request (set by authenticateUser middleware)
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Extract resource ID from params (common conventions)
      let resourceId = req.params.resourceId || req.params.id || req.params.courseId || 
                     req.params.moduleId || req.params.sectionId || req.params.videoMetadataId ||
                     req.params.contentId || req.params.progressId || req.params.userId;

      // Handle create operations where resource ID might not be in params
      if (policyKey.endsWith(':create')) {
        // For create operations, we might need to check access to parent resource
        // For example, creating a module requires access to the course
        const parentIdMap: Record<string, string> = {
          'module:create': 'courseId',
          'section:create': 'moduleId',
          'videoMetadata:create': 'sectionId',
          'content:create': 'sectionId',
          'progress:create': 'sectionId' // or could be userId+sectionId combo
        };

        const parentParam = parentIdMap[policyKey];
        if (parentParam && req.params[parentParam]) {
          resourceId = req.params[parentParam];
        } else {
          // Check body for parent ID
          resourceId = (req.body as any)[parentIdMap[policyKey]];
        }

        if (!resourceId) {
          return res.status(400).json({ 
            error: 'Missing resource ID for create operation',
            requiredPolicy: policyKey 
          });
        }

        // For create, check read access to parent (to ensure they can see the parent)
        const readPolicyKey = policyKey.replace(':create', ':read');
        const policyFn = POLICIES[readPolicyKey];
        if (!policyFn) {
          return res.status(500).json({ error: 'Unknown policy' });
        }

        const allowed = await policyFn(user, resourceId);
        if (!allowed) {
          return res.status(403).json({ 
            error: 'Forbidden: Insufficient permissions',
            requiredPolicy: policyKey,
            userRole: user.role,
            userId: user.id
          });
        }

        return next();
      }

      // For non-create operations, validate the policy directly
      const policyFn = POLICIES[policyKey];
      if (!policyFn) {
        return res.status(500).json({ error: 'Unknown policy' });
      }

      // If we don't have a resource ID, we can't check the policy
      if (!resourceId) {
        return res.status(400).json({ 
          error: 'Missing resource ID',
          requiredPolicy: policyKey 
        });
      }

      const allowed = await policyFn(user, resourceId);
      if (!allowed) {
        return res.status(403).json({ 
          error: 'Forbidden: Insufficient permissions',
          requiredPolicy: policyKey,
          userRole: user.role,
          userId: user.id
        });
      }

      next();
    } catch (error) {
      console.error('Authorization error:', error);
      return res.status(500).json({ error: 'Internal server error during authorization' });
    }
  };
}
