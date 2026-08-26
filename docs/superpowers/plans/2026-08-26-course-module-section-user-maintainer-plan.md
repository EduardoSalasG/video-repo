# Course/Module/Section/User Maintainer Roles with Logic Delete Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement role-based access control with course/module/section/user maintainer capabilities, logic delete for all entities, and course-level access control.

**Architecture:** Hybrid approach using existing roles (ADMIN, INSTRUCTOR, STUDENT) enhanced with course-specific access controls via CourseUserAccess table, policy-based authorization middleware, and logic delete (soft delete) implementation.

**Tech Stack:** Node.js, TypeScript, Express.js, PostgreSQL with Prisma ORM, JWT authentication, Tailwind CSS for frontend responsiveness.

**Spec:** docs/superpowers/specs/2026-08-26-course-module-section-user-maintainer-design.md

## Global Constraints
- Maintain existing API contracts where possible
- Use TypeScript strict mode
- Follow existing code patterns and conventions
- All async functions must handle errors
- Explicit error handling with custom error types
- Logic delete (soft delete) for all deletion operations
- Preset breakpoints: mobile (<640px), tablet (640-1024px), desktop (>1024px)
- WCAG 2.1 AA accessibility compliance

---

### Task 1: Database Schema Updates

**Files:**
- Modify: `backend/prisma/schema.prisma`
- Modify: `backend/src/models/*.ts` (if manual model files exist)
- Create: `backend/prisma/migrations/` migration files

**Interfaces:**
- Consumes: None (foundational)
- Produces: Updated database schema with isDeleted/deletedAt fields and CourseUserAccess table

- [ ] **Step 1: Add isDeleted and deletedAt fields to User model**
```prisma
model User {
  // ... existing fields ...
  isDeleted  Boolean   @default(false)
  deletedAt  DateTime?
  
  // ... existing relations ...
}
```

- [ ] **Step 2: Add isDeleted and deletedAt fields to Course model**
```prisma
model Course {
  // ... existing fields ...
  isDeleted  Boolean   @default(false)
  deletedAt  DateTime?
  
  // ... existing relations ...
}
```

- [ ] **Step 3: Add isDeleted and deletedAt fields to Module model**
```prisma
model Module {
  // ... existing fields ...
  isDeleted  Boolean   @default(false)
  deletedAt  DateTime?
  
  // ... existing relations ...
}
```

- [ ] **Step 4: Add isDeleted and deletedAt fields to Section model**
```prisma
model Section {
  // ... existing fields ...
  isDeleted  Boolean   @default(false)
  deletedAt  DateTime?
  
  // ... existing relations ...
}
```

- [ ] **Step 5: Add isDeleted and deletedAt fields to VideoMetadata model**
```prisma
model VideoMetadata {
  // ... existing fields ...
  isDeleted  Boolean   @default(false)
  deletedAt  DateTime?
  
  // ... existing relations ...
}
```

- [ ] **Step 6: Add isDeleted and deletedAt fields to UserProgress model**
```prisma
model UserProgress {
  // ... existing fields ...
  isDeleted  Boolean   @default(false)
  deletedAt  DateTime?
  
  // ... existing relations ...
}
```

- [ ] **Step 7: Create CourseUserAccess model**
```prisma
model CourseUserAccess {
  id        String   @id @default(uuid())
  userId    String
  courseId  String
  accessLevel AccessLevel  @default(READ)
  grantedBy String
  grantedAt DateTime @default(now())
  
  user      User   @relation(fields: [userId], references: [id])
  course    Course @relation(fields: [courseId], references: [id])
  
  @@unique([userId, courseId])
}

enum AccessLevel {
  READ
  WRITE
  MAINTAIN
}
```

- [ ] **Step 8: Create and run database migration**
```bash
npx prisma migrate dev --name add-maintainer-roles-and-soft-delete
```

- [ ] **Step 9: Commit database changes**
```bash
git add backend/prisma/schema.prisma backend/prisma/migrations/
git commit -m "feat: add isDeleted/deletedAt fields and CourseUserAccess for maintainer roles"
```

### Task 2: Policy-Based Authorization System

**Files:**
- Create: `backend/src/policies/CoursePolicy.ts`
- Create: `backend/src/policies/ModulePolicy.ts`
- Create: `backend/src/policies/SectionPolicy.ts`
- Create: `backend/src/policies/VideoMetadataPolicy.ts`
- Create: `backend/src/policies/ContentPolicy.ts`
- Create: `backend/src/policies/ProgressPolicy.ts`
- Create: `backend/src/middleware/authorizePolicy.ts`

**Interfaces:**
- Consumes: Database schema from Task 1
- Produces: Policy classes and authorization middleware

- [ ] **Step 1: Create CoursePolicy class with create/read/update/delete methods**
```typescript
export class CoursePolicy {
  static async create(user: User): Promise<boolean> {
    return user.role === 'ADMIN' && !user.isDeleted;
  }

  static async read(user: User, courseId: string): Promise<boolean> {
    // ... implementation ...
  }
  // ... other methods ...
}
```

- [ ] **Step 2: Create ModulePolicy class**
- [ ] **Step 3: Create SectionPolicy class**
- [ ] **Step 4: Create VideoMetadataPolicy class**
- [ ] **Step 5: Create ContentPolicy class**
- [ ] **Step 6: Create ProgressPolicy class**
- [ ] **Step 7: Create authorizePolicy middleware**
- [ ] **Step 8: Commit policy files**
```bash
git add backend/src/policies/ backend/src/middleware/authorizePolicy.ts
git commit -m "feat: add policy-based authorization system"
```

### Task 3: Update Authorization Middleware and Routes

**Files:**
- Modify: `backend/src/middleware/auth.ts` (if needed)
- Modify: `backend/src/routes/courseRoutes.ts`
- Modify: `backend/src/routes/moduleRoutes.ts`
- Modify: `backend/src/routes/sectionRoutes.ts`
- Modify: `backend/src/routes/videoRoutes.ts`
- Modify: `backend/src/routes/contentRoutes.ts`
- Modify: `backend/src/routes/progressRoutes.ts`

**Interfaces:**
- Consumes: Policy classes from Task 2
- Produces: Protected routes with policy-based authorization

- [ ] **Step 1: Update courseRoutes.ts with policy-based protection**
```typescript
import { authorizePolicy } from '../middleware/authorizePolicy';
// ... 
router.get('/', authenticateUser, authorizePolicy('course:read'), CourseController.getAllCourses);
// ... other routes ...
```

- [ ] **Step 2: Update moduleRoutes.ts with policy-based protection**
- [ ] **Step 3: Update sectionRoutes.ts with policy-based protection**
- [ ] **Step 4: Update videoRoutes.ts with policy-based protection**
- [ ] **Step 5: Update contentRoutes.ts with policy-based protection**
- [ ] **Step 6: Update progressRoutes.ts with policy-based protection**
- [ ] **Step 7: Commit route updates**
```bash
git add backend/src/routes/
git commit -m "feat: update routes with policy-based authorization"
```

### Task 4: Implement Logic Delete in Controllers

**Files:**
- Modify: `backend/src/controllers/CourseController.ts`
- Modify: `backend/src/controllers/ModuleController.ts`
- Modify: `backend/src/controllers/SectionController.ts`
- Modify: `backend/src/controllers/VideoController.ts`
- Modify: `backend/src/controllers/ContentController.ts` (if delete added)
- Modify: `backend/src/controllers/ProgressController.ts` (if delete added)
- Create: `backend/src/controllers/UserController.ts` (if implementing user management)

**Interfaces:**
- Consumes: Updated database schema from Task 1
- Produces: Controllers with logic delete implementation

- [ ] **Step 1: Update CourseController.deleteCourse for logic delete**
```typescript
static async deleteCourse(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const course = await prisma.course.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date()
      }
    });
    res.status(200).json(course);
  } catch (error) {
    // ... error handling ...
  }
}
```

- [ ] **Step 2: Update ModuleController.deleteModule for logic delete**
- [ ] **Step 3: Update SectionController.deleteSection for logic delete**
- [ ] **Step 4: Update VideoController.deleteVideoMetadata for logic delete**
- [ ] **Step 5: Update controller find methods to exclude deleted records**
```typescript
// Example: getAllCourses
static async getAllCourses(_req: Request, res: Response): Promise<void> {
  const courses = await prisma.course.findMany({
    where: { isDeleted: false }
  });
  res.json({ courses });
}
```

- [ ] **Step 6: Commit controller updates**
```bash
git add backend/src/controllers/
git commit -m "feat: implement logic delete in controllers"
```

### Task 5: Implement Course Access Management

**Files:**
- Create: `backend/src/controllers/AccessController.ts`
- Modify: `backend/src/routes/accessRoutes.ts` (new file)
- Modify: `backend/src/app.ts` (to register new routes)

**Interfaces:**
- Consumes: Policy classes and database schema
- Produces: API endpoints for granting/revoking course access

- [ ] **Step 1: Create AccessController class with grantAccess/revokeAccess/getCourseUsers methods**
```typescript
export class AccessController {
  static async grantAccess(req: Request, res: Response): Promise<void> {
    // ... validation and implementation ...
  }
  // ... other methods ...
}
```

- [ ] **Step 2: Create accessRoutes.ts with policy protection**
```typescript
import { Router } from 'express';
import { authenticateUser } from '../middleware/auth';
import { authorizePolicy } from '../middleware/authorizePolicy';
import { AccessController } from '../controllers/AccessController';

const router = Router();

router.post('/:courseId/access', 
  authenticateUser, 
  authorizePolicy('course:maintain'), 
  AccessController.grantAccess
);
// ... other routes ...

export default router;
```

- [ ] **Step 3: Register accessRoutes in app.ts**
```typescript
import accessRoutes from './routes/accessRoutes';
// ...
app.use('/courses', accessRoutes);
// ...
```

- [ ] **Step 4: Commit access management implementation**
```bash
git add backend/src/controllers/AccessController.ts backend/src/routes/accessRoutes.ts backend/src/app.ts
git commit -m "feat: add course access management endpoints"
```

### Task 6: Update Frontend for Responsiveness and Accessibility

**Files:**
- Modify: `frontend/src/app/layout.ts` (or equivalent)
- Modify: `frontend/src/app/page.tsx` and other page files
- Modify: `frontend/src/components/**/*.tsx`
- Modify: `frontend/tailwind.config.ts` (if needed)

**Interfaces:**
- Consumes: Protected backend API routes
- Produces: Responsive, accessible frontend UI

- [ ] **Step 1: Update global layout for responsive design**
```typescript
// Ensure proper viewport meta tag and root styling
```

- [ ] **Step 2: Update CourseListPage for responsive grid**
```typescript
// Change from fixed grid to responsive:
// <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
```

- [ ] **Step 3: Update CourseDetailPage for responsive layout**
- [ ] **Step 4: Update ModuleListPage and ModuleDetailPage**
- [ ] **Step 5: Update SectionViewPage**
- [ ] **Step 6: Update navigation components for mobile collapsible menu**
- [ ] **Step 7: Update form components for responsive input layouts**
- [ ] **Step 8: Update video player for responsive dimensions**
- [ ] **Step 9: Ensure proper color contrast and accessible elements**
- [ ] **Step 10: Add ARIA labels where needed**
- [ ] **Step 11: Test on iPhone 8+ dimensions (375x667px)**
- [ ] **Step 12: Test on tablet sizes (768x1024, 834x1112)**
- [ ] **Step 13: Test on desktop resolutions**
- [ ] **Step 14: Commit frontend updates**
```bash
git add frontend/src/
git commit -m "feat: implement responsive design and accessibility improvements"
```

### Task 7: Update Authentication and User Management

**Files:**
- Modify: `backend/src/controllers/authController.ts` (if needed for role handling)
- Create: `backend/src/controllers/UserController.ts` (for user management)
- Modify: `backend/src/routes/authRoutes.ts` (if adding user management routes)

**Interfaces:**
- Consumes: Updated User model with isDeleted field
- Produces: Enhanced authentication and user management

- [ ] **Step 1: Update authController.login to handle isDeleted users**
```typescript
// Check if user is deleted
if (user.isDeleted) {
  return res.status(401).json({ error: 'Invalid email or password' });
}
```

- [ ] **Step 2: Create UserController for admin-only user management**
```typescript
export class UserController {
  static async getAllUsers(req: Request, res: Response): Promise<void> {
    // Only admins can list users
    // ... implementation ...
  }
  // ... other CRUD operations with logic delete ...
}
```

- [ ] **Step 3: Add user management routes protected by requireAdmin**
```typescript
// In authRoutes.ts or new userRoutes.ts
router.get('/', authenticateUser, requireAdmin, UserController.getAllUsers);
// ... other routes ...
```

- [ ] **Step 4: Commit authentication updates**
```bash
git add backend/src/controllers/authController.ts backend/src/controllers/UserController.ts backend/src/routes/authRoutes.ts
git commit -m "feat: update authentication and add user management"
```

### Task 8: Testing and Verification

**Files:**
- Modify: `backend/tests/integration/*.test.ts`
- Modify: `backend/tests/unit/*.test.ts`
- Create: `frontend/tests/` (if needed)

**Interfaces:**
- Consumes: All implemented features
- Produces: Verified implementation

- [ ] **Step 1: Update integration tests for protected routes**
```typescript
// Add authentication tokens to test requests
// Test 403 responses for unauthorized access
// Test logic delete behavior
```

- [ ] **Step 2: Update unit tests for policy classes**
```typescript
// Test CoursePolicy.create/read/update/delete
// Test ModulePolicy methods
// ... etc ...
```

- [ ] **Step 3: Add tests for course access management**
```typescript
// Test granting/revoking access
// Test access level enforcement
```

- [ ] **Step 4: Run all tests to verify implementation**
```bash
npm test --workspace backend
```

- [ ] **Step 5: Fix any failing tests**
- [ ] **Step 6: Commit test updates**
```bash
git add backend/tests/
git commit -m "feat: update tests for maintainer roles and logic delete"
```

### Task 9: Final Integration and Documentation

**Files:**
- Modify: `README.md` (if needed)
- Modify: `backend/README.md`
- Modify: `frontend/README.md`

**Interfaces:**
- Consumes: All completed tasks
- Produces: Fully functional system

- [ ] **Step 1: Perform end-to-end testing of key workflows**
  - User registration and login
  - Course creation (admin only)
  - Granting course access to users
  - Module/section creation within accessible courses
  - Logic delete verification
  - Access denied responses

- [ ] **Step 2: Verify responsiveness on target devices**
  - iPhone 8+ simulation
  - Tablet simulation  
  - Desktop testing

- [ ] **Step 3: Update documentation with new features**
  - API documentation for new endpoints
  - Role-based access control explanation
  - Logic delete behavior

- [ ] **Step 4: Final commit**
```bash
git add .
git commit -m "feat: implement course/module/section/user maintainer roles with logic delete and responsiveness"
```