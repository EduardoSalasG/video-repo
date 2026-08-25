# Course Level Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Course level as top-level container for organizing content by dance style, changing hierarchy from Modules → Sections → Videos+Markdown to Courses → Modules → Sections → Modules → Sections → Videos+Markdown.

**Architecture:** Add Course model with id, name, description fields. Module model updated with courseId foreign key to Course. All API endpoints updated to reflect nested hierarchy: /courses/:courseId/modules/:moduleId/sections/:sectionId. Frontend updated to show Course > Module > Section navigation hierarchy.

**Tech Stack:** 
- Backend: Node.js, TypeScript, Express, Prisma ORM, PostgreSQL
- Frontend: React, TypeScript, Next.js, Tailwind CSS
- Database: PostgreSQL with Prisma ORM

**Spec:** docs/superpowers/specs/2026-08-25-course-level-design.md

## Global Constraints

- TypeScript 5.x
- Prisma ORM for database access
- RESTful API design
- Clean slate approach (no backward compatibility maintenance)
- Course names map to dance styles: "Mambo on2", "Casino", "Sensual Bachata", "Modern Bachata"
- All existing Section → VideoMetadata → UserProgress relationships unchanged
- API endpoints use nested resource pattern
---
### Task 1: Database Migration - Course Table

**Files:**
- Create: `backend/prisma/migrations/20260825_create_course_table/migration.sql`
- Modify: `backend/prisma/schema.prisma:80-106`

**Interfaces:**
- Consumes: None
- Produces: Course table with id (UUID), name, description, timestamps; Module table with courseId foreign key

- [ ] **Step 1: Write migration SQL for Course table**

```sql
-- CreateCourseTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT (gen_random_uuid()),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Add courseId to Module table
ALTER TABLE "Module" ADD COLUMN "courseId" TEXT NOT NULL;
ALTER TABLE "Module" ADD CONSTRAINT "Module_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
```

- [ ] **Step 2: Update Prisma schema with Course model and Module.courseId relation**

```prisma
model Course {
  id        String   @id @default(uuid())
  name      String
  description String?
  modules   Module[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Module {
  id            String   @id @default(uuid())
  title         String
  description   String?
  orderIndex    Int      @default(0)
  courseId      String
  course        Course   @relation(fields: [courseId], references: [id])
  sections      Section[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

- [ ] **Step 3: Apply migration and generate Prisma client**

Run: `cd backend && prisma migrate dev --name create-course-table`
Expected: Migration applied successfully, Prisma client generated

- [ ] **Step 4: Commit**

```bash
git add backend/prisma/
git commit -m "feat(db): add Course table and courseId to Module"
```

### Task 2: Course Service Implementation

**Files:**
- Create: `backend/src/services/CourseService.ts`
- Modify: `backend/src/services/index.ts:1-10`

**Interfaces:**
- Consumes: Course model from Prisma
- Produces: CourseService with CRUD methods: findAllCourses, findCourseById, createCourse, updateCourse, deleteCourse

- [ ] **Step 1: Write failing test for CourseService.findAllCourses**

```typescript
import { CourseService } from './CourseService';

describe('CourseService', () => {
  describe('findAllCourses', () => {
    it('should return empty array when no courses exist', async () => {
      const courses = await CourseService.findAllCourses();
      expect(courses).toEqual([]);
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && npm test -- src/services/CourseService.test.ts`
Expected: FAIL with "CourseService not found"

- [ ] **Step 3: Write minimal CourseService implementation**

```typescript
import prisma from '../config/database';

export class CourseService {
  static async findAllCourses() {
    return prisma.course.findMany();
  }

  static async findCourseById(id: string) {
    return prisma.course.findUnique({ where: { id } });
  }

  static async createCourse(data: { name: string; description?: string }) {
    return prisma.course.create({ data });
  }

  static async updateCourse(id: string, data: { name?: string; description?: string }) {
    return prisma.course.update({ where: { id }, data });
  }

  static async deleteCourse(id: string) {
    return prisma.course.delete({ where: { id } });
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd backend && npm test -- src/services/CourseService.test.ts`
Expected: PASS

- [ ] **Step 5: Export CourseService from services index**

```typescript
export { CourseService } from './CourseService';
// ... other exports
```

- [ ] **Step 6: Commit**

```bash
git add backend/src/services/CourseService.ts backend/src/services/index.ts
git commit -m "feat(service): add CourseService"
```

### Task 3: Course Controller Implementation

**Files:**
- Create: `backend/src/controllers/CourseController.ts`
- Modify: `backend/src/controllers/index.ts:1-10`
- Modify: `backend/src/routes/api.ts:1-20`

**Interfaces:**
- Consumes: CourseService
- Produces: REST endpoints for Course CRUD operations

- [ ] **Step 1: Write failing test for GET /courses endpoint**

```typescript
import request from 'supertest';
import { app } from '../app';

describe('Course Controller', () => {
  describe('GET /courses', () => {
    it('should return empty array when no courses exist', async () => {
      const response = await request(app).get('/courses');
      expect(response.status).toBe(200);
      expect(response.body.courses).toEqual([]);
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && npm test -- src/controllers/CourseController.test.ts`
Expected: FAIL with "CourseController not found"

- [ ] **Step 3: Write minimal CourseController implementation**

```typescript
import { Request, Response } from 'express';
import { CourseService } from '../services/CourseService';

export class CourseController {
  static async getAllCourses(req: Request, res: Response) {
    const courses = await CourseService.findAllCourses();
    res.json({ courses });
  }

  static async getCourseById(req: Request, res: Response) {
    const { id } = req.params;
    const course = await CourseService.findCourseById(id);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json(course);
  }

  static async createCourse(req: Request, res: Response) {
    const { name, description } = req.body;
    const course = await CourseService.createCourse({ name, description });
    res.status(201).json(course);
  }

  static async updateCourse(req: Request, res: Response) {
    const { id } = req.params;
    const { name, description } = req.body;
    const course = await CourseService.updateCourse(id, { name, description });
    res.json(course);
  }

  static async deleteCourse(req: Request, res: Response) {
    const { id } = req.params;
    await CourseService.deleteCourse(id);
    res.status(204).send();
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd backend && npm test -- src/controllers/CourseController.test.ts`
Expected: PASS

- [ ] **Step 5: Export CourseController from controllers index**

```typescript
export { CourseController } from './CourseController';
// ... other exports
```

- [ ] **Step 6: Add Course routes to api.ts**

```typescript
import { CourseController } from './controllers/CourseController';
// ... other imports

// Courses
app.get('/courses', CourseController.getAllCourses);
app.get('/courses/:id', CourseController.getCourseById);
app.post('/courses', CourseController.createCourse);
app.patch('/courses/:id', CourseController.updateCourse);
app.delete('/courses/:id', CourseController.deleteCourse);

// ... existing routes
```

- [ ] **Step 7: Commit**

```bash
git add backend/src/controllers/CourseController.ts backend/src/controllers/index.ts backend/src/routes/api.ts
git commit -m "feat(controller): add CourseController"
```

### Task 4: Update Module Service for Course Relation

**Files:**
- Modify: `backend/src/services/ModuleService.ts`
- Modify: `backend/src/services/index.ts:1-10` (if needed for exports)

**Interfaces:**
- Consumes: CourseService (for validation), Module model
- Produces: Updated ModuleService with courseId validation and course existence checks

- [ ] **Step 1: Write failing test for ModuleService.createModule with invalid courseId**

```typescript
import { ModuleService } from './ModuleService';

describe('ModuleService', () => {
  describe('createModule', () => {
    it('should throw error when courseId does not exist', async () => {
      await expect(
        ModuleService.createModule({
          title: 'Test Module',
          description: 'Test Description',
          courseId: 'non-existent-course-id'
        })
      ).rejects.toThrow('Course not found');
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && npm test -- src/services/ModuleService.test.ts`
Expected: FAIL with "Course not found" validation not implemented

- [ ] **Step 3: Update ModuleService with courseId validation**

```typescript
import prisma from '../config/database';
import { CourseService } from './CourseService';

export class ModuleService {
  static async findAllModules(params: any = {}) {
    const { page = 1, limit = 10, search, courseId } = params;
    
    const where = {
      ...(courseId && { courseId }),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' as const } },
              {
                description: { contains: search, mode: 'insensitive' as const },
              },
            ],
          }
        : {}),
    };

    const [modules, total] = await Promise.all([
      prisma.module.findMany({
        where,
        orderBy: { orderIndex: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { _count: { select: { sections: true } } },
      }),
      prisma.module.count({ where }),
    ]);

    return {
      modules: modules.map((module) => ({
        id: module.id,
        title: module.title,
        description: module.description,
        orderIndex: module.orderIndex,
        sectionCount: module._count.sections,
        createdAt: module.createdAt,
        updatedAt: module.updatedAt,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  static async findModuleById(id: string) {
    return prisma.module.findUnique({
      where: { id },
      include: {
        sections: {
          orderBy: { orderIndex: 'asc' },
          select: {
            id: true,
            title: true,
            description: true,
            orderIndex: true,
            videoUrl: true,
            markdownContent: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });
  }

  static async createModule(data: { title: string; description?: string; orderIndex?: number; courseId: string }) {
    // Validate course exists
    const course = await CourseService.findCourseById(data.courseId);
    if (!course) {
      throw new Error('Course not found');
    }
    
    return prisma.module.create({
      data: {
        title: data.title,
        description: data.description,
        orderIndex: data.orderIndex ?? 0,
        courseId: data.courseId,
      },
    });
  }

  static async updateModule(id: string, data: { title?: string; description?: string | null; orderIndex?: number; courseId?: string }) {
    // If courseId is being updated, validate it exists
    if (data.courseId) {
      const course = await CourseService.findCourseById(data.courseId);
      if (!course) {
        throw new Error('Course not found');
      }
    }
    
    return prisma.module.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        orderIndex: data.orderIndex,
        courseId: data.courseId,
      },
    });
  }

  static async deleteModule(id: string) {
    return prisma.module.delete({ where: { id } });
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd backend && npm test -- src/services/ModuleService.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/src/services/ModuleService.ts
git commit -m "feat(service): update ModuleService with courseId validation"
```

### Task 5: Update Module Controller for Course Relation

**Files:**
- Modify: `backend/src/controllers/ModuleController.ts`
- Modify: `backend/src/controllers/index.ts:1-10` (if needed for exports)
- Modify: `backend/src/routes/api.ts:1-20`

**Interfaces:**
- Consumes: Updated ModuleService
- Produces: REST endpoints for Module operations with courseId in path

- [ ] **Step 1: Write failing test for GET /courses/:courseId/modules endpoint**

```typescript
import request from 'supertest';
import { app } from '../app';

describe('Module Controller', () => {
  describe('GET /courses/:courseId/modules', () => {
    it('should return modules for specified course', async () => {
      // This would require setting up test data
      const response = await request(app).get('/courses/test-course-id/modules');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.modules)).toBe(true);
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && npm test -- src/controllers/ModuleController.test.ts`
Expected: FAIL with route not found or controller not updated

- [ ] **Step 3: Update ModuleController to require courseId**

```typescript
import { Request, Response } from 'express';
import { ModuleService } from '../services/ModuleService';

export class ModuleController {
  static async getAllModules(req: Request, res: Response) {
    const { courseId } = req.params;
    const { page, limit, search } = req.query;
    
    const modules = await ModuleService.findAllModules({
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      search: search as string || undefined,
      courseId: courseId as string
    });
    
    res.json(modules);
  }

  static async getModuleById(req: Request, res: Response) {
    const { courseId, moduleId } = req.params;
    const module = await ModuleService.findModuleById(moduleId);
    
    // Additional validation: ensure module belongs to course
    if (module && module.courseId !== courseId) {
      return res.status(404).json({ error: 'Module not found in course' });
    }
    
    if (!module) {
      return res.status(404).json({ error: 'Module not found' });
    }
    
    res.json(module);
  }

  static async createModule(req: Request, res: Response) {
    const { courseId } = req.params;
    const { title, description, orderIndex } = req.body;
    
    const module = await ModuleService.createModule({
      title,
      description,
      orderIndex: orderIndex ?? 0,
      courseId,
    });
    
    res.status(201).json(module);
  }

  static async updateModule(req: Request, res: Response) {
    const { courseId, moduleId } = req.params;
    const { title, description, orderIndex } = req.body;
    
    const module = await ModuleService.updateModule(moduleId, {
      title,
      description,
      orderIndex: orderIndex ?? undefined,
      courseId, // This will validate course exists
    });
    
    res.json(module);
  }

  static async deleteModule(req: Request, res: Response) {
    const { courseId, moduleId } = req.params;
    await ModuleService.deleteModule(moduleId);
    res.status(204).send();
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd backend && npm test -- src/controllers/ModuleController.test.ts`
Expected: PASS

- [ ] **Step 5: Update Module routes in api.ts to be nested under courses**

```typescript
// Replace existing module routes with nested ones
// Remove or comment out:
// app.get('/modules', ModuleController.getAllModules);
// app.get('/modules/:id', ModuleController.getModuleById);
// etc.

// Add nested module routes
app.get('/courses/:courseId/modules', ModuleController.getAllModules);
app.get('/courses/:courseId/modules/:moduleId', ModuleController.getModuleById);
app.post('/courses/:courseId/modules', ModuleController.createModule);
app.patch('/courses/:courseId/modules/:moduleId', ModuleController.updateModule);
app.delete('/courses/:courseId/modules/:moduleId', ModuleController.deleteModule);

// Keep other routes unchanged (auth, sections, etc.)
```

- [ ] **Step 6: Commit**

```bash
git add backend/src/controllers/ModuleController.ts backend/src/controllers/index.ts backend/src/routes/api.ts
git commit -m "feat(controller): update ModuleController for courseId nesting"
```

### Task 6: Update Section Controller Routes for Nesting

**Files:**
- Modify: `backend/src/routes/api.ts:1-20`

**Interfaces:**
- Consumes: SectionController (unchanged)
- Produces: REST endpoints for Section operations nested under courses and modules

- [ ] **Step 1: Update Section routes in api.ts to be nested under courses and modules**

```typescript
// Replace existing section routes with nested ones
// Remove or comment out:
// app.get('/modules/:moduleId/sections', SectionController.getAllSections);
// app.get('/modules/:moduleId/sections/:sectionId', SectionController.getSectionById);
// etc.

// Add nested section routes
app.get('/courses/:courseId/modules/:moduleId/sections', SectionController.getAllSections);
app.get('/courses/:courseId/modules/:moduleId/sections/:sectionId', SectionController.getSectionById);
app.post('/courses/:courseId/modules/:moduleId/sections', SectionController.createSection);
app.patch('/courses/:courseId/modules/:moduleId/sections/:sectionId', SectionController.updateSection);
app.delete('/courses/:courseId/modules/:moduleId/sections/:sectionId', SectionController.deleteSection);

// Keep other routes unchanged (auth, courses, modules, etc.)
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/routes/api.ts
git commit -m "feat(routes): nest section routes under courses and modules"
```

### Task 7: Update Search Endpoint for Course Filtering

**Files:**
- Modify: `backend/src/controllers/SearchController.ts`
- Modify: `backend/src/controllers/index.ts:1-10` (if needed for exports)
- Modify: `backend/src/routes/api.ts:1-20`

**Interfaces:**
- Consumes: SectionService (for search functionality)
- Produces: Search endpoint with courseId filtering capability

- [ ] **Step 1: Write failing test for GET /search with courseId parameter**

```typescript
import request from 'supertest';
import { app } from '../app';

describe('Search Controller', () => {
  describe('GET /search', () => {
    it('should filter sections by courseId when provided', async () => {
      const response = await request(app)
        .get('/search')
        .query({ courseId: 'test-course-id' });
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.sections)).toBe(true);
      // All sections should belong to the specified course
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && npm test -- src/controllers/SearchController.test.ts`
Expected: FAIL with courseId filtering not implemented

- [ ] **Step 3: Update SearchController to handle courseId filtering**

```typescript
import { Request, Response } from 'express';
import { SectionService } from '../services/SectionService';

export class SearchController {
  static async searchSections(req: Request, res: Response) {
    const {
      q,
      moduleId,
      difficulty,
      primaryStyle,
      influences,
      steps,
      videoType,
      tags,
      durationCountsMin,
      durationCountsMax,
      page,
      limit,
      sort,
      courseId // New parameter
    } = req.query;
    
    const sections = await SectionService.searchSections({
      q: q as string || undefined,
      moduleId: moduleId as string || undefined,
      difficulty: difficulty as any || undefined,
      primaryStyle: primaryStyle as any || undefined,
      influences: influences as string || undefined,
      steps: steps as string || undefined,
      videoType: videoType as any || undefined,
      tags: tags as string || undefined,
      durationCountsMin: durationCountsMin ? parseInt(durationCountsMin as string) : undefined,
      durationCountsMax: durationCountsMax ? parseInt(durationCountsMax as string) : undefined,
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      sort: sort as string || undefined,
      courseId: courseId as string || undefined // Pass courseId to service
    });
    
    res.json(sections);
  }
}
```

- [ ] **Step 4: Update SectionService to handle courseId filtering in search**

```typescript
// In SectionService.searchSections method, add courseId to where clause
static async searchSections(params: any = {}) {
  // ... existing code ...
  
  const where = {
    // ... existing conditions ...
    ...(params.courseId && {
      module: {
        courseId: params.courseId
      }
    })
  };
  
  // ... rest of method unchanged ...
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd backend && npm test -- src/controllers/SearchController.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add backend/src/controllers/SearchController.ts backend/src/services/SectionService.ts
git commit -m "feat(search): add courseId filtering to search endpoint"
```

### Task 8: Update Progress Endpoint Responses to Include Course Info

**Files:**
- Modify: `backend/src/controllers/ProgressController.ts`
- Modify: `backend/src/controllers/index.ts:1-10` (if needed for exports)

**Interfaces:**
- Consumes: UserProgress model with relations to Section → Module → Course
- Produces: Progress responses that include course information

- [ ] **Step 1: Write failing test for GET /users/:userId/progress including course info**

```typescript
import request from 'supertest';
import { app } from '../app';

describe('Progress Controller', () => {
  describe('GET /users/:userId/progress', () => {
    it('should include course information in progress items', async () => {
      const response = await request(app).get('/users/test-user-id/progress');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.progress)).toBe(true);
      if (response.body.progress.length > 0) {
        const progressItem = response.body.progress[0];
        expect(progressItem).toHaveProperty('courseId');
        expect(progressItem).toHaveProperty('courseName');
      }
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && npm test -- src/controllers/ProgressController.test.ts`
Expected: FAIL with course information not included

- [ ] **Step 3: Update ProgressController to include course info in responses**

```typescript
import { Request, Response } from 'express';
import { UserProgressService } from '../services/UserProgressService';

export class ProgressController {
  static async getUserProgress(req: Request, res: Response) {
    const { userId } = req.params;
    const progress = await UserProgressService.getUserProgress(userId);
    
    // Enhance progress items with course information
    const enhancedProgress = await Promise.all(
      progress.map(async (item) => {
        // Get section with module and course info
        const sectionWithRelations = await prisma.section.findUnique({
          where: { id: item.sectionId },
          include: {
            module: {
              include: {
                course: true
              }
            }
          }
        });
        
        return {
          ...item,
          sectionTitle: sectionWithRelations?.title ?? null,
          moduleTitle: sectionWithRelations?.module?.title ?? null,
          courseId: sectionWithRelations?.module?.course?.id ?? null,
          courseName: sectionWithRelations?.module?.course?.name ?? null
        };
      })
    );
    
    res.json({ progress: enhancedProgress });
  }
  
  // ... other methods (getProgress, createProgress) remain largely unchanged
  // but may need similar enhancements for consistency
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd backend && npm test -- src/controllers/ProgressController.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/src/controllers/ProgressController.ts
git commit -m "feat(controller): enhance progress responses with course information"
```

### Task 9: Create Frontend Course Pages and Components

**Files:**
- Create: `frontend/src/app/courses/page.tsx` (CourseListPage)
- Create: `frontend/src/app/courses/[courseId]/page.tsx` (CourseDetailPage)
- Create: `frontend/src/components/CourseCard.tsx`
- Create: `frontend/src/components/CourseGrid.tsx`
- Create: `frontend/src/components/NavCourseSelector.tsx`

**Interfaces:**
- Consumes: Course API endpoints
- Produces: Course listing and detail pages with navigation

- [ ] **Step 1: Write failing test for CourseListPage (conceptual - describe what we expect)**

```text
// Conceptual test description:
 // CourseListPage should:
 // - Fetch courses from /courses API endpoint
 // - Display CourseCard for each course
 // - Show loading state while fetching
 // - Show error message if fetch fails
```

- [ ] **Step 2: Create CourseListPage (app/courses/page.tsx)**

```typescript
import Link from 'next/link';
import { CourseCard } from '@/components/CourseCard';

export default async function CourseListPage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses`);
  const { courses } = await res.json();

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">Courses</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course: any) => (
          <Link key={course.id} href={`/courses/${course.id}`} className="block">
            <CourseCard course={course} />
          </Link>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Create CourseDetailPage (app/courses/[courseId]/page.tsx)**

```typescript
import Link from 'next/link';
import { ModuleCard } from '@/components/ModuleCard';

export default async function CourseDetailPage({
  params
}: {
  params: { courseId: string }
}) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${params.courseId}`);
  const course = await res.json();
  
  const modulesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${params.courseId}/modules`);
  const { modules } = await modulesRes.json();

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{course.name}</h1>
        <p className="text-sm text-muted-foreground">{course.description}</p>
      </div>
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Modules</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((module: any) => (
            <Link key={module.id} href={`/courses/${params.courseId}/modules/${module.id}`} className="block">
              <ModuleCard module={module} />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Create CourseCard component**

```typescript
import Link from 'next/link';

interface CourseCardProps {
  course: {
    id: string;
    name: string;
    description?: string;
  };
}

export default function CourseCard({ course }: CourseCardProps) {
  return (
    <Link href={`/courses/${course.id}`} className="block rounded-2xl bg-surface-raised p-5 shadow-sm transition hover:shadow-md">
      <h3 className="text-lg font-semibold tracking-tight">{course.name}</h3>
      {course.description && (
        <p className="mt-1 text-sm text-muted-foreground">{course.description}</p>
      )}
    </Link>
  );
}
```

- [ ] **Step 5: Create CourseGrid layout component**

```typescript
// Simple wrapper for styling - can be enhanced as needed
export default function CourseGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {children}
    </div>
  );
}
```

- [ ] **Step 6: Create NavCourseSelector component**

```typescript
import { useEffect, useState } from 'react';

export default function NavCourseSelector({ onCourseChange }: { onCourseChange: (courseId: string) => void }) {
  const [courses, setCourses] = useState<Array<{id: string; name: string}>>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  useEffect(() => {
    async function loadCourses() {
      try {
        setLoading(true);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses`);
        const { courses } = await res.json();
        setCourses(courses);
        if (courses.length > 0) {
          setSelectedCourseId(courses[0].id);
          onCourseChange(courses[0].id);
        }
      } catch (error) {
        console.error('Failed to load courses:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadCourses();
  }, [onCourseChange]);

  if (loading) return <div>Loading courses...</div>;
  
  return (
    <select
      value={selectedCourseId}
      onChange={(e) => {
        const courseId = e.target.value;
        setSelectedCourseId(courseId);
        onCourseChange(courseId);
      }}
      className="border rounded px-3 py-2"
    >
      {courses.map(course => (
        <option key={course.id} value={course.id}>
          {course.name}
        </option>
      ))}
    </select>
  );
}
```

- [ ] **Step 7: Commit frontend components**

```bash
git add frontend/src/app/courses/page.tsx frontend/src/app/courses/[courseId]/page.tsx
git add frontend/src/components/CourseCard.tsx frontend/src/components/CourseGrid.tsx frontend/src/components/NavCourseSelector.tsx
git commit -m "feat(frontend): add Course pages and components"
```

### Task 10: Update Frontend Module Pages for Course Context

**Files:**
- Modify: `frontend/src/app/courses/[courseId]/modules/page.tsx` (ModuleListPage in course context)
- Modify: `frontend/src/app/courses/[courseId]/modules/[moduleId]/page.tsx` (ModuleDetailPage in course context)
- Update existing ModuleListPage and ModuleDetailPage if they exist outside course context (may need to redirect or remove)

**Interfaces:**
- Consumes: Module API endpoints with courseId
- Produces: Module listing and detail pages showing course context

- [ ] **Step 1: Create ModuleListPage in course context**

```typescript
import Link from 'next/link';
import { ModuleCard } from '@/components/ModuleCard';
import { NavCourseSelector } from '@/components/NavCourseSelector';

export default async function ModuleListPage({
  params
}: {
  params: { courseId: string }
}) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${params.courseId}/modules`);
  const { modules, pagination } = await res.json();

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Modules</h1>
        <NavCourseSelector onCourseChange={(courseId) => {
          // Redirect to modules page for new course
          window.location.href = `/courses/${courseId}/modules`;
        }} />
      </div>
      
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((module: any) => (
            <Link key={module.id} href={`/courses/${params.courseId}/modules/${module.id}`} className="block">
              <ModuleCard module={module} />
            </Link>
          ))}
        </div>
      </div>
      
      {/* Pagination controls would go here */}
    </section>
  );
}
```

- [ ] **Step 2: Create ModuleDetailPage in course context**

```typescript
import Link from 'next/link';
import { SectionItem } from '@/components/SectionItem';

export default async function ModuleDetailPage({
  params
}: {
  params: { courseId: string; moduleId: string }
}) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${params.courseId}/modules/${params.moduleId}`);
  const module = await res.json();

  const sectionsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${params.courseId}/modules/${params.moduleId}/sections`);
  const { sections } = await sectionsRes.json();

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">{module.title}</h1>
        <p className="text-sm text-muted-foreground">{module.description}</p>
      </div>
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Sections</h2>
        <div className="space-y-2">
          {sections.map((section: any) => (
            <Link key={section.id} href={`/courses/${params.courseId}/modules/${params.moduleId}/sections/${section.id}`} className="block">
              <SectionItem section={section} />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Update existing top-level Module pages to redirect or show course selector**

```typescript
// In frontend/src/app/modules/page.tsx (if it exists)
// Redirect to course selector or show message to select course first
export default function ModuleListPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Select a Course</h1>
      <p className="mt-4">
        Please select a course first to view its modules.
        <Link href="/courses" className="text-primary-foreground underline">
          Browse Courses
        </Link>
      </p>
    </div>
  );
}
```

- [ ] **Step 4: Commit frontend module updates**

```bash
git add frontend/src/app/courses/[courseId]/modules/page.tsx frontend/src/app/courses/[courseId]/modules/[moduleId]/page.tsx
# If modifying existing module pages:
# git add frontend/src/app/modules/page.tsx frontend/src/app/modules/[moduleId]/page.tsx
git commit -m "feat(frontend): update Module pages for course context"
```

### Task 11: Update Frontend Section Pages for Course/Module Context

**Files:**
- Modify: `frontend/src/app/courses/[courseId]/modules/[moduleId]/sections/[sectionId]/page.tsx` (SectionViewPage in context)

**Interfaces:**
- Consumes: Section API endpoints with courseId and moduleId
- Produces: Section detail page showing course/module context

- [ ] **Step 1: Create SectionViewPage in course/module context**

```typescript
import Link from 'next/link';

export default async function SectionViewPage({
  params
}: {
  params: { 
    courseId: string; 
    moduleId: string; 
    sectionId: string 
  }
}) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${params.courseId}/modules/${params.moduleId}/sections/${params.sectionId}`);
  const section = await res.json();

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">{section.title}</h1>
        <p className="text-sm text-muted-foreground">{section.description}</p>
      </div>
      
      {/* Video player if videoUrl exists */}
      {section.videoUrl && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Video</h2>
          <video controls className="rounded-lg w-full max-w-[640px]">
            <source src={section.videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      )}
      
      {/* Markdown content if exists */}
      {section.markdownContent && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Explanation</h2>
          <div className="prose prose-sm max-w-none">
            {/* In a real app, you'd use a markdown renderer here */}
            <p dangerouslySetInnerHTML={{ __html: section.markdownContent }} />
          </div>
        </div>
      )}
      
      {/* Metadata if exists */}
      {section.metadata && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-2">Metadata</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="font-medium">Difficulty</h3>
              <p>{section.metadata.difficulty}</p>
            </div>
            <div>
              <h3 className="font-medium">Primary Style</h3>
              <p>{section.metadata.primaryStyle}</p>
            </div>
            {/* Add other metadata fields as needed */}
          </div>
        </div>
      )}
      
      <div className="mt-6 flex items-center space-x-4">
        <Link href={`/courses/${params.courseId}/modules/${params.moduleId}`} className="hover:underline">
          ← Back to Modules
        </Link>
        <Link href={`/courses/${params.courseId}`} className="hover:underline">
          ← Back to Course
        </Link>
        <Link href="/courses" className="ml-auto hover:underline">
          ← All Courses
        </Link>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Update breadcrumbs in layout components to show course > module > section**

```typescript
// In frontend/src/components/layout/Breadcrumbs.tsx or similar
export default function Breadcrumbs({ 
  courseName, 
  moduleTitle, 
  sectionTitle 
}: { 
  courseName?: string; 
  moduleTitle?: string; 
  sectionTitle?: string 
}) {
  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
      <Link href="/" className="hover:underline">
        Home
      </Link>
      {courseName && (
        <>
          <span className="mx-2">/</span>
          <Link href={`/courses/${courseName.toLowerCase().replace(/\s+/g, '-')}`} className="hover:underline">
            {courseName}
          </Link>
        </>
      )}
      {moduleTitle && (
        <>
          <span className="mx-2">/</span>
          <Link href={`/courses/${courseName?.toLowerCase().replace(/\s+/g, '-')}/modules/${moduleTitle.toLowerCase().replace(/\s+/g, '-')}`} className="hover:underline">
            {moduleTitle}
          </Link>
        </>
      )}
      {sectionTitle && (
        <>
          <span className="mx-2">/</span>
          <span className="font-medium">{sectionTitle}</span>
        </>
      )}
    </nav>
  );
}
```

- [ ] **Step 3: Commit frontend section updates**

```bash
git add frontend/src/app/courses/[courseId]/modules/[moduleId]/sections/[sectionId]/page.tsx
# If updating breadcrumbs component:
# git add frontend/src/components/layout/Breadcrumbs.tsx
git commit -m "feat(frontend): update Section pages for course/module context"
```

### Task 12: Seed Initial Course Data

**Files:**
- Create: `backend/prisma/seed.ts`
- Modify: `package.json` (add seed script if needed)

**Interfaces:**
- Consumes: CourseService
- Produces: Initial course data in database

- [ ] **Step 1: Create seed script for initial courses**

```typescript
import { CourseService } from './src/services/CourseService';

async function main() {
  console.log(`Start seeding ...`);
  
  const courseNames = [
    { name: 'Mambo on2', description: 'Mambo On2 NY style' },
    { name: 'Casino', description: 'Casino style salsa' },
    { name: 'Sensual Bachata', description: 'Sensual Bachata style' },
    { name: 'Modern Bachata', description: 'Modern Bachata style' }
  ];
  
  for (const courseData of courseNames) {
    const course = await CourseService.createCourse(courseData);
    console.log(`Created course with id: ${course.id}, name: ${course.name}`);
  }
  
  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promise
    // @ts-ignore
    prisma.$disconnect();
  });
```

- [ ] **Step 2: Add seed script to package.json**

```json
{
  "scripts": {
    // ... existing scripts ...
    "seed": "ts-node prisma/seed.ts"
  }
}
```

- [ ] **Step 3: Run seed script to populate initial courses**

Run: `cd backend && npm run seed`
Expected: Creates 4 courses with the specified names and descriptions

- [ ] **Step 4: Commit**

```bash
git add backend/prisma/seed.ts package.json
git commit -m "feat(seed): add initial course data"
```

### Task 13: Update Documentation and API Specifications

**Files:**
- Modify: `docs/api.md` (if exists)
- Modify: `backend/README.md` (if exists)
- Modify: `frontend/README.md` (if exists)

**Interfaces:**
- Consumes: None
- Produces: Updated documentation reflecting Course level changes

- [ ] **Step 1: Update API documentation to reflect new endpoints**

```markdown
# API Documentation

## Courses

### GET /courses
// ... etc.

### GET /courses/:id
// ... etc.

// ... all other Course endpoints ...

## Modules (Nested under Courses)

### GET /courses/:courseId/modules
// ... etc.

### GET /courses/:courseId/modules/:moduleId
// ... etc.

// ... all other Module endpoints with courseId ...

## Sections (Nested under Courses and Modules)

### GET /courses/:courseId/modules/:moduleId/sections
// ... etc.

### GET /courses/:courseId/modules/:moduleId/sections/:sectionId
// ... etc.

// ... all other Section endpoints with courseId and moduleId ...
```

- [ ] **Step 2: Update backend/README.md with Course information**

```markdown
# Backend - Dance Education Platform

## Features

- Course management (CRUD)
- Module management (nested under courses)
- Section management (nested under courses and modules)
- Video upload and metadata
- Markdown content management
- Search and filtering
- Progress tracking
- Authentication and authorization

## API Endpoints

See [API Documentation](./docs/api.md) for complete endpoint listing.
```

- [ ] **Step 3: Update frontend/README.md with Course navigation information**

```markdown
# Frontend - Dance Education Platform

## Features

- Course browsing and selection
- Module listing within course context
- Section viewing within course/module context
- Video player with controls
- Markdown content rendering
- Progress tracking
- Authentication-protected routes

## Navigation

Home → Courses → [Course Name] → Modules → [Module Title] → Sections → [Section Title]
```

- [ ] **Step 4: Commit documentation updates**

```bash
git add docs/api.md backend/README.md frontend/README.md
git commit -m "docs: update documentation for Course level implementation"
```

### Task 14: Run Comprehensive Test Suite

**Files:**
- None (task executes tests)

**Interfaces:**
- Consumes: All implemented functionality
- Produces: Test results verifying Course level implementation works correctly

- [ ] **Step 1: Run backend unit tests**

Run: `cd backend && npm test`
Expected: All unit tests pass

- [ ] **Step 2: Run backend integration tests**

Run: `cd backend && npm run test:integration`
Expected: All integration tests pass

- [ ] **Step 3: Run frontend unit tests**

Run: `cd frontend && npm test`
Expected: All unit tests pass

- [ ] **Step 4: Run end-to-end tests (if applicable)**

Run: `npm run test:e2e` (or appropriate command)
Expected: All E2E tests pass

- [ ] **Step 5: Commit test results (if any artifacts generated)**

```bash
# If test coverage reports or similar are generated:
git add coverage/
git commit -m "test: update coverage reports"
# Or if no artifacts:
git commit --allow-empty -m "test: all tests pass for Course level implementation"
```

### Task 15: Final Implementation Review and Cleanup

**Files:**
- Various (review and potential cleanup)

**Interfaces:**
- Consumes: All implemented code
- Produces: Clean, production-ready implementation

- [ ] **Step 1: Review all changes against spec**

Verify that all requirements from docs/superpowers/specs/2026-08-25-course-level-design.md are met

- [ ] **Step 2: Run linting to ensure code quality**

Run: `npm run lint` (in both backend and frontend)
Expected: No linting errors

- [ ] **Step 3: Fix any linting errors**

```bash
# Fix linting errors as needed
git add .
git commit -m "style: fix linting errors"
```

- [ ] **Step 4: Ensure all dependencies are properly installed**

Run: `npm install` (in root directory)
Expected: All dependencies installed successfully

- [ ] **Step 5: Final commit**

```bash
git add .
git commit -m "feat(course-level): implement Course level for dance education platform"
```

## Acceptance Criteria Verification

All acceptance criteria from the spec should be verifiable through the completion of these tasks:

- [ ] Course model implemented with id, name, description fields
- [ ] Module model updated with courseId foreign key to Course
- [ ] Section model unchanged (still belongs to Module)
- [ ] All API endpoints updated to reflect Course-Module-Section hierarchy
- [ ] Frontend navigation shows Course > Module > Section hierarchy
- [ ] New Course CRUD endpoints functional
- [ ] Updated Module CRUD endpoints require course context
- [ ] Section CRUD endpoints work within course/module context
- [ ] Search filtering by courseId functional
- [ ] Progress tracking includes course information in responses
- [ ] Database migration creates Course table and adds courseId to Module
- [ ] Application seeds with initial course data (Mambo on2, Casino, Sensual Bachata, Modern Bachata)
- [ ] Unit tests for Course service and controller
- [ ] Integration tests for Course-Module-Section API flow
- [ ] E2E tests for creating and navigating course content

## Dependencies

- Backend: Node.js >= 18.x, TypeScript >= 5.0.x
- Frontend: Node.js >= 18.x, TypeScript >= 5.0.x
- Database: PostgreSQL >= 13.x
- Dev: Prisma >= 5.0.x