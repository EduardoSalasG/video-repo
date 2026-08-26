# Role-Based Access Control with Maintainer Roles and Logic Delete

## Overview
This design implements a comprehensive access control system with:
1. **Course/Module/Section/User maintainer roles** mapped to existing roles via capabilities
2. **Logic delete (soft delete)** for all deletion operations
3. **Course-level access control** ensuring users can only access courses they're authorized for
4. **Policy-based middleware** for clean, maintainable authorization logic
5. **Full route protection** including previously unprotected course routes

The system uses a hybrid approach: existing roles (ADMIN, INSTRUCTOR, STUDENT) are enhanced with course-specific access controls and capability-based permissions.

---

## 1. Database Changes

### 1.1 New Tables

#### CourseUserAccess Model
```prisma
model CourseUserAccess {
  id        String   @id @default(uuid())
  userId    String
  courseId  String
  accessLevel AccessLevel  @default(READ) // ENUM: READ, WRITE, MAINTAIN
  grantedBy String        // ID of user who granted access
  grantedAt DateTime @default(now())
  
  user      User   @relation(fields: [userId], references: [id])
  course    Course @relation(fields: [courseId], references: [id])
  
  @@unique([userId, courseId])
}

enum AccessLevel {
  READ     // Can view course content
  WRITE    // Can create/edit modules/sections/content
  MAINTAIN // Full course maintenance (create/update/delete course)
}
```

#### Enhanced User Model (add isDeleted for logic delete)
```prisma
model User {
  // ... existing fields ...
  isDeleted  Boolean   @default(false)
  deletedAt  DateTime?
  
  // ... existing relations ...
}
```

Apply similar `isDeleted` and `deletedAt` fields to:
- Course
- Module  
- Section
- VideoMetadata
- UserProgress
- CourseUserAccess

### 1.2 Rationale
- **CourseUserAccess**: Explicitly tracks which users have access to which courses and at what level
- **Logic delete fields**: `isDeleted` flag + `deletedAt` timestamp for soft deletes
- **AccessLevel enum**: Granular control over what users can do within a course

---

## 2. Authorization System

### 2.1 Policy Objects
Create policy classes that encapsulate access rules:

#### CoursePolicy.ts
```typescript
export class CoursePolicy {
  // Only admins can create courses
  static async create(user: User): Promise<boolean> {
    return user.role === 'ADMIN' && !user.isDeleted;
  }

  // Users can read courses they have access to
  static async read(user: User, courseId: string): Promise<boolean> {
    if (user.isDeleted) return false;
    
    // Admins can read any course
    if (user.role === 'ADMIN') return true;
    
    // Check explicit course access
    const access = await prisma.courseUserAccess.findFirst({
      where: { userId: user.id, courseId },
      select: { id: true }
    });
    
    return !!access;
  }

  // Only admins and course maintainers can update courses
  static async update(user: User, courseId: string): Promise<boolean> {
    if (user.isDeleted) return false;
    
    // Admins can update any course
    if (user.role === 'ADMIN') return true;
    
    // Check if user has WRITE or MAINTAIN access to this course
    const access = await prisma.courseUserAccess.findFirst({
      where: { 
        userId: user.id, 
        courseId,
        accessLevel: { in: ['WRITE', 'MAINTAIN'] }
      }
    });
    
    return !!access;
  }

  // Only admins can delete courses (logic delete)
  static async delete(user: User, courseId: string): Promise<boolean> {
    return user.role === 'ADMIN' && !user.isDeleted;
  }
}
```

#### ModulePolicy.ts
```typescript
export class ModulePolicy {
  // Users can read modules in courses they have READ access to
  static async read(user: User, moduleId: string): Promise<boolean> {
    if (user.isDeleted) return false;
    
    // Get module with its course
    const module = await prisma.module.findUnique({
      where: { id: moduleId },
      select: { courseId: true }
    });
    
    if (!module) return false;
    
    // Check course access
    return CoursePolicy.read(user, module.courseId);
  }

  // Users can create/update modules if they have WRITE access to course
  static async write(user: User, moduleId: string): Promise<boolean> {
    if (user.isDeleted) return false;
    
    const module = await prisma.module.findUnique({
      where: { id: moduleId },
      select: { courseId: true }
    });
    
    if (!module) return false;
    
    // Check course WRITE access
    const access = await prisma.courseUserAccess.findFirst({
      where: { 
        userId: user.id, 
        courseId: module.courseId,
        accessLevel: { in: ['WRITE', 'MAINTAIN'] }
      }
    });
    
    return !!access;
  }

  // Only admins can delete modules (logic delete)
  static async delete(user: User, moduleId: string): Promise<boolean> {
    if (user.isDeleted) return false;
    
    const module = await prisma.module.findUnique({
      where: { id: moduleId },
      select: { courseId: true }
    });
    
    if (!module) return false;
    
    return CoursePolicy.delete(user, module.courseId);
  }
}
```

Similar policies for SectionPolicy, VideoMetadataPolicy, ContentPolicy, ProgressPolicy.

### 2.2 Authorization Middleware
Create generic policy-based middleware:

#### authorizePolicy.ts
```typescript
import { Request, Response, NextFunction } from 'express';
import { CoursePolicy } from '../policies/CoursePolicy';
import { ModulePolicy } from '../policies/ModulePolicy';
// ... import other policies

type PolicyFn = (user: User, resourceId: string) => Promise<boolean>;

interface PolicyMap {
  [key: string]: PolicyFn;
}

const POLICIES: PolicyMap = {
  'course:create': CoursePolicy.create,
  'course:read': CoursePolicy.read,
  'course:update': CoursePolicy.update,
  'course:delete': CoursePolicy.delete,
  
  'module:read': ModulePolicy.read,
  'module:create': ModulePolicy.write,
  'module:update': ModulePolicy.write,
  'module:delete': ModulePolicy.delete,
  
  // ... similar for section, video, content, progress
};

export function authorizePolicy(policyKey: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      // Extract resource ID from params (convention: :resourceId)
      const resourceId = req.params.resourceId || req.params.id;
      if (!resourceId) {
        // For create operations, resource ID might be in body or courseId param
        if (policyKey.endsWith(':create')) {
          // Handle create case - might need courseId from params
          const courseId = req.params.courseId;
          if (!courseId) {
            return res.status(400).json({ error: 'Missing courseId' });
          }
          // For create, check access to parent course
          const policyFn = POLICIES[policyKey.replace(':create', ':read')];
          const allowed = await policyFn!(user, courseId);
          if (!allowed) {
            return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
          }
          return next();
        }
        return res.status(400).json({ error: 'Missing resource ID' });
      }
      
      const policyFn = POLICIES[policyKey];
      if (!policyFn) {
        return res.status(500).json({ error: 'Unknown policy' });
      }
      
      const allowed = await policyFn(user, resourceId);
      if (!allowed) {
        return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
      }
      
      next();
    } catch (error) {
      console.error('Authorization error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}
```

### 2.3 Route Protection Updates
Update all route files to use policy-based middleware:

#### courseRoutes.ts (NEW - now protected)
```typescript
import { Router } from 'express';
import { authenticateUser } from '../middleware/auth';
import { authorizePolicy } from '../middleware/authorizePolicy';
import { CourseController } from '../controllers/CourseController';

const router = Router();

// All authenticated users can read courses they have access to
router.get('/', authenticateUser, authorizePolicy('course:read'), CourseController.getAllCourses);
router.get('/:id', authenticateUser, authorizePolicy('course:read'), CourseController.getCourseById);

// Only admins can create courses
router.post('/', authenticateUser, authorizePolicy('course:create'), CourseController.createCourse);

// Only admins can update courses
router.patch('/:id', authenticateUser, authorizePolicy('course:update'), CourseController.updateCourse);

// Only admins can delete courses (logic delete)
router.delete('/:id', authenticateUser, authorizePolicy('course:delete'), CourseController.deleteCourse);

export default router;
```

#### moduleRoutes.ts (updated)
```typescript
import { Router } from 'express';
import { authenticateUser } from '../middleware/auth';
import { authorizePolicy } from '../middleware/authorizePolicy';
import {
  getModules,
  getModuleById,
  createModuleController,
  updateModuleController,
  deleteModuleController,
} from '../controllers/moduleController';

const router = Router({ mergeParams: true })

// All authenticated users can read modules in courses they have access to
router.get('/', authenticateUser, authorizePolicy('module:read'), getModules);
router.get('/:moduleId', authenticateUser, authorizePolicy('module:read'), getModuleById);

// Users with WRITE access to course can create modules
router.post('/', authenticateUser, authorizePolicy('module:create'), createModuleController);

// Users with WRITE access to course can update modules
router.patch('/:moduleId', authenticateUser, authorizePolicy('module:update'), updateModuleController);

// Only admins can delete modules (logic delete)
router.delete('/:moduleId', authenticateUser, authorizePolicy('module:delete'), deleteModuleController);

export default router;
```

Similar updates for sectionRoutes.ts, videoRoutes.ts, contentRoutes.ts, progressRoutes.ts.

---

## 3. Controller Updates (Logic Delete)

Update all controller functions to implement logic delete instead of hard delete.

### Example: CourseController.deleteCourse
```typescript
static async deleteCourse(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    
    // Logic delete: set isDeleted=true and deletedAt timestamp
    const course = await prisma.course.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date()
      }
    });
    
    res.status(200).json(course); // Return deleted course for confirmation
  } catch (error) {
    // ... error handling ...
  }
}
```

Apply similar logic delete to:
- ModuleController.deleteModule
- SectionController.deleteSection  
- VideoController.deleteVideoMetadata
- ContentController (no delete currently, but if added would use logic delete)
- ProgressController (progress records might be hard deleted or archived differently)
- UserController.deleteUser (if implemented)

Also update all find/query methods to exclude deleted records by default:
```typescript
// Instead of:
// await prisma.course.findMany();

// Use:
await prisma.course.findMany({
  where: { isDeleted: false }
});
```

Or create a Prisma middleware/global scope to automatically filter out deleted records.

---

## 4. Course Access Management

### 4.1 Granting Course Access
Need API endpoints for admins/instructors to grant users access to courses:

#### New endpoint in courseRoutes.ts or accessRoutes.ts
```typescript
// Grant user access to course
router.post('/:courseId/access', 
  authenticateUser, 
  authorizePolicy('course:maintain'), // Or specific grant access policy
  accessController.grantAccess
);

// Revoke user access to course  
router.delete('/:courseId/access/:userId',
  authenticateUser,
  authorizePolicy('course:maintain'),
  accessController.revokeAccess
);

// Get users with access to course
router.get('/:courseId/access',
  authenticateUser,
  authorizePolicy('course:read'),
  accessController.getCourseUsers
);
```

### 4.2 Access Controller
```typescript
export class AccessController {
  static async grantAccess(req: Request, res: Response): Promise<void> {
    try {
      const { courseId } = req.params;
      const { userId, accessLevel } = req.body;
      
      // Validate grantor has MAINTAIN access to course
      const user = (req as any).user;
      const maintainAccess = await CoursePolicy.maintain(user, courseId);
      if (!maintainAccess) {
        return res.status(403).json({ error = 'Forbidden: Insufficient permissions to grant access' });
      }
      
      // Create or update access record
      const access = await prisma.courseUserAccess.upsert({
        where: { userId_courseId: { userId, courseId } },
        update: { accessLevel, grantedBy: user.id, grantedAt: new Date() },
        create: { userId, courseId, accessLevel, grantedBy: user.id }
      });
      
      res.status(201).json(access);
    } catch (error) {
      // ... error handling ...
    }
  }
  
  // ... revokeAccess, getCourseUsers methods ...
}
```

---

## 5. Frontend Considerations

### 5.1 Route Updates
Frontend routes need to match new protected backend routes:
- All API calls will now require authentication
- Course access checking will happen on backend
- UI should handle 403 responses gracefully (show "Access denied" messages)

### 5.2 Responsiveness & Accessibility (Per Requirements)

#### Implementation Approach:
1. **Use Tailwind's responsive prefixes** consistently:
   - `text-base sm:text-lg lg:text-xl` for typography
   - `p-4 sm:p-6` for padding
   - `space-y-4 sm:space-y-6` for spacing
   - `flex-col sm:flex-row` for layout direction changes

2. **Follow WCAG 2.1 AA guidelines**:
   - Proper color contrast (use Tailwind's color system which is accessible)
   - Semantic HTML elements (`<header>`, `<nav>`, `<main>`, `<section>`)
   - ARIA labels where needed
   - Focus management for modals/dropdowns
   - Keyboard navigation support

3. **Mobile-first breakpoints** targeting:
   - Mobile: < 640px (Tailwind sm)
   - Tablet: 640px - 1024px (Tailwind sm to lg)  
   - Desktop: > 1024px (Tailwind lg+)

4. **Specific component improvements**:
   - Navigation: Collapsible sidebar on mobile, horizontal on desktop
   - Course cards: Stack vertically on mobile, grid on tablet/desktop
   - Forms: Single column on mobile, potentially multi-column on desktop
   - Video player: Full width on mobile, constrained width on desktop
   - Tables: Scrollable on mobile, full width on desktop

5. **Testing**: 
   - Test on actual iPhone 8+ dimensions (375x667px viewport)
   - Test on common tablet sizes (768x1024, 834x1112, etc.)
   - Test desktop variations
   - Use browser dev tools for responsive testing
   - Manual accessibility testing with screen readers if possible

#### Files to Update:
- All frontend components in `/frontend/src/components/` and `/frontend/src/app/`
- Focus on layout, spacing, typography, and interactive elements
- Ensure all pages are responsive: course listing, course detail, module views, section views, etc.

---

## 6. Error Handling & Responses

### 6.1 Standardized Error Responses
All authorization failures return:
```json
{
  "error": "Forbidden: Insufficient permissions",
  "requiredPolicy": "course:update",
  "userRole": "INSTRUCTOR",
  "userId": "user-uuid",
  "timestamp": "2026-08-26T..."
}
```

### 6.2 Logging
- Authorization decisions logged at debug level
- Failed access attempts logged at warn level for security monitoring
- No sensitive data in logs

---

## 7. Migration Strategy

### 7.1 Database Migration
1. Add `isDeleted` and `deletedAt` columns to all relevant tables (default false/null)
2. Create CourseUserAccess table
3. Create index on CourseUserAccess(userId, courseId) for performance
4. Backfill: Set existing users' access levels appropriately (maybe all users get READ access to all existing courses initially?)

### 7.2 Deployment Steps
1. Deploy database migrations
2. Deploy backend code with new middleware and policies
3. Deploy frontend updates (responsiveness fixes can be incremental)
4. Monitor logs for authorization issues
5. Optionally add course access granting UI for admins

---

## 8. Advantages of This Design

### 8.1 Security
- Principle of least privilege: Users only get access they need
- Explicit deny by default: No access unless explicitly granted
- Centralized authorization logic in policies
- Logic delete prevents accidental data loss

### 8.2 Maintainability
- Policies are easy to understand and modify
- Middleware is generic and reusable
- Clear separation of concerns (controllers handle logic, policies handle auth)
- Easy to audit who can do what

### 8.3 Flexibility
- Easy to add new resource types (just create new policy)
- Easy to add new permission levels
- Course access can be granted/revoked dynamically
- Works with existing role system

### 8.4 User Experience
- Clear error messages when access denied
- Consistent behavior across all resources
- Responsive design works on all target devices
- Accessible to users with disabilities

---

## Summary

This design provides:
✅ Course/Module/Section/User maintainer capabilities mapped to existing roles
✅ Logic delete for all deletion operations  
✅ Course-level access control preventing unauthorized access
✅ Policy-based middleware for clean, maintainable authorization
✅ Full route protection including previously open course routes
✅ Foundation for responsive, accessible frontend implementation
✅ Extensible design for future enhancements

The approach balances security with usability, providing fine-grained control while keeping the system understandable and maintainable.