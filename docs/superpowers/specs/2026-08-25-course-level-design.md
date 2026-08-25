# Feature Specification: Course Level Implementation

**Status**: Approved  
**Owner**: implementer  
**Created**: 2026-08-25  
**Updated**: 2026-08-25  

## Overview

This document describes the implementation of a Course level in the dance education platform hierarchy. The current structure is:
`Modules → Sections → Videos+Markdown`

The new structure will be:
`Courses → Modules → Sections → Videos+Markdown`

Where:
- Course represents a dance style (e.g., "Mambo on2", "Casino", "Sensual Bachata", "Modern Bachata")
- Each Course contains multiple Modules (chapters/units)
- Each Module contains Sections (lessons)
- Each Section contains Video content and optional Markdown explanations

## Goals

1. Add Course entity as top-level container for organizing content by dance style
2. Maintain existing Module and Section functionality with Course association
3. Update API endpoints to reflect the new hierarchical structure
4. Update frontend navigation and views to show Course context
5. Provide clean migration path (clean slate approach as agreed)

## Non-Goals

- Changing the existing Section → VideoMetadata → UserProgress relationships
- Adding Course-level metadata beyond basic identification (name, description)
- Maintaining backward compatibility with old Module-only APIs (clean slate approach)

## Data Model Changes

### Course Model

```typescript
interface Course {
  id: string; // UUID
  name: string; // e.g., "Mambo on2", "Casino", "Sensual Bachata", "Modern Bachata"
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Updated Module Model

```typescript
interface Module {
  id: string;
  title: string;
  description?: string;
  courseId: string; // Foreign key to Course
  orderIndex: number;
  createdAt: Date;
  updatedAt: Date;
  // Sections relationship remains unchanged
}
```

### Section Model (Unchanged)

```typescript
interface Section {
  id: string;
  moduleId: string;
  title: string;
  description?: string;
  orderIndex: number;
  videoUrl?: string;
  markdownContent?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Prisma Schema Updates

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

// Section model remains unchanged
```

## API Endpoint Changes

All existing endpoints will be updated to include course context where appropriate.

### Courses

#### GET /courses
**Response** (200):
```json
{
  "courses": [{
    "id": "string",
    "name": "string",
    "description": "string|null",
    "createdAt": "string",
    "updatedAt": "string"
  }],
  "pagination": { /* standard pagination */ }
}
```

#### GET /courses/:id
**Response** (200):
```json
{
  "id": "string",
  "name": "string",
  "description": "string|null",
  "modules": [{
    "id": "string",
    "title": "string",
    "description": "string|null",
    "orderIndex": number,
    "sectionCount": number,
    "createdAt": "string",
    "updatedAt": "string"
  }],
  "createdAt": "string",
  "updatedAt": "string"
}
```

#### POST /courses
**Request**:
```json
{
  "name": "string",
  "description": "string"
}
```
**Response** (201): Course object

#### PATCH /courses/:id
**Request**:
```json
{
  "name?: string",
  "description?: string"
}
```
**Response** (200): Updated course object

#### DELETE /courses/:id
**Response** (204): No content

### Modules (Nested under Courses)

#### GET /courses/:courseId/modules
**Response** (200):
```json
{
  "modules": [{
    "id": "string",
    "title": "string",
    "description": "string|null",
    "orderIndex": number,
    "sectionCount": number,
    "createdAt": "string",
    "updatedAt": "string"
  }],
  "pagination": { /* standard pagination */ }
}
```

#### GET /courses/:courseId/modules/:moduleId
**Response** (200):
```json
{
  "id": "string",
  "title": "string",
  "description": "string|null",
  "orderIndex": number,
  "courseId": "string",
  "sections": [{
    "id": "string",
    "title": "string",
    "description": "string|null",
    "orderIndex": number,
    "videoUrl": "string|null",
    "markdownContent": "string|null",
    "createdAt": "string",
    "updatedAt": "string"
  }],
  "createdAt": "string",
  "updatedAt": "string"
}
```

#### POST /courses/:courseId/modules
**Request**:
```json
{
  "title": "string",
  "description": "string",
  "orderIndex?: number"
}
```
**Response** (201): Module object

#### PATCH /courses/:courseId/modules/:moduleId
**Request**:
```json
{
  "title?: string",
  "description?: string",
  "orderIndex?: number"
}
```
**Response** (200): Updated module object

#### DELETE /courses/:courseId/modules/:moduleId
**Response** (204): No content

### Sections (Nested under Courses and Modules)

All existing section endpoints remain functionally identical but are now nested:
- GET /courses/:courseId/modules/:moduleId/sections
- POST /courses/:courseId/modules/:moduleId/sections
- GET /courses/:courseId/modules/:moduleId/sections/:sectionId
- PATCH /courses/:courseId/modules/:moduleId/sections/:sectionId
- DELETE /courses/:courseId/modules/:moduleId/sections/:sectionId

### Video Upload & Metadata (Unchanged nesting)
- POST /courses/:courseId/modules/:moduleId/sections/:sectionId/upload
- PATCH /courses/:courseId/modules/:moduleId/sections/:sectionId/metadata
- GET /courses/:courseId/modules/:moduleId/sections/:sectionId/metadata

### Content (Markdown) (Unchanged nesting)
- PATCH /courses/:courseId/modules/:moduleId/sections/:sectionId/content
- GET /courses/:courseId/modules/:moduleId/sections/:sectionId/content

### Search & Filtering
#### GET /search
**Query** (additional parameter):
```
courseId?: string       // filter by course
```

**Response** (200): Sections now include course information
```json
{
  "sections": [{
    "id": "string",
    "title": "string",
    "description": "string",
    "moduleId": "string",
    "moduleTitle": "string",
    "courseId": "string",
    "courseName": "string",
    "videoUrl": "string|null",
    "markdownContent": "string|null",
    "metadata": { /* unchanged */ },
    "createdAt": "string",
    "updatedAt": "string"
  }],
  "pagination": { /* standard pagination */ }
}
```

### Progress Tracking (Unchanged nesting)
- POST /progress (unchanged - uses sectionId)
- GET /progress/:sectionId (unchanged)
- GET /users/:userId/progress (now includes course information)

## Backend Implementation Changes

### 1. New Course Service
- CourseService.ts: CRUD operations for Course model
- Handles validation (unique course names, etc.)

### 2. Updated Module Service
- ModuleService.ts: Added courseId parameter to all methods
- Added validation to ensure course exists before creating/updating modules
- Updated relations to include Course in queries where needed

### 3. Section Service (Unchanged)
- No changes needed as Section still belongs to Module

### 4. New Course Controller
- CourseController.ts: REST endpoints for Course CRUD operations

### 5. Updated Module Controller
- ModuleController.ts: All endpoints now require courseId in URL/path
- Updated to use ModuleService with courseId validation

### 6. Section Controller (Unchanged)
- Routes updated to be nested under courses and modules
- No logic changes needed

### 7. Middleware Updates
- Add validation middleware for courseId parameters
- Add course existence checks where appropriate

## Frontend Implementation Changes

### 1. New Pages
- CourseListPage.tsx: Lists all courses (similar to ModuleListPage)
- CourseDetailPage.tsx: Shows course details and its modules

### 2. Updated Pages
- ModuleListPage.tsx: Now shows modules within a course context
  - Route: /courses/:courseId/modules
  - Shows breadcrumb: Home > Course Name > Modules
- SectionViewPage.tsx: Now shows section within course/module context
  - Route: /courses/:courseId/modules/:moduleId/sections/:sectionId
  - Shows breadcrumb: Home > Course Name > Module Title > Section Title

### 3. New Components
- CourseCard.tsx: Similar to ModuleCard but for courses
- CourseGrid.tsx: Layout for displaying multiple courses
- NavCourseSelector.tsx: Dropdown/select for choosing course context

### 4. Updated Components
- ModuleCard.tsx: Unchanged (still used within course context)
- SectionItem.tsx: Unchanged (still used within module context)
- Navigation/Breadcrumb components: Updated to show course > module > section hierarchy

### 5. Routing Updates
```jsx
// Courses
<Route path="/courses" element={<CourseListPage />} />
<Route path="/courses/:courseId" element={<CourseDetailPage />} />

// Modules (nested under courses)
<Route path="/courses/:courseId/modules" element={<ModuleListPage />} />
<Route path="/courses/:courseId/modules/:moduleId" element={<ModuleDetailPage />} />

// Sections (nested under courses and modules)
<Route path="/courses/:courseId/modules/:moduleId/sections/:sectionId" element={<SectionViewPage />} />
```

### 6. State Management
- Add course context to relevant state stores
- Update hooks to accept courseId parameters where needed

## Database Migration

Since we're using the clean slate approach as agreed:

1. **Create migration to add Course table**
2. **Add courseId column to Module table with foreign key constraint to Course**
3. **No data migration needed** - starting with empty database
4. **Application will need to be seeded with initial courses**:
   - Mambo on2
   - Casino  
   - Sensual Bachata
   - Modern Bachata

## Testing Considerations

### Unit Tests
- Course service: CRUD operations, validation
- Module service: courseId validation, course existence checks
- Course controller: endpoint responses, error handling

### Integration Tests
- Course CRUD API endpoints
- Module CRUD API endpoints (with course context)
- Section CRUD API endpoints (with course/module context)
- Search filtering by courseId
- Progress tracking includes course information

### E2E Tests
- Creating a course, adding modules, adding sections
- Navigating through course > module > section hierarchy
- Searching/filtering by course
- Tracking progress shows course context

## Impact Evaluation

### Positive Impacts
1. **Better Organization**: Aligns with users' mental model of dance styles as top-level categories
2. **Scalability**: Enables future features like:
   - Course-level metadata (pricing, difficulty level, instructor)
   - Course enrollment and access control
   - Course progress tracking and certificates
3. **Clarity**: Clear hierarchical structure makes navigation more intuitive
4. **Flexibility**: Easy to add new dance styles as new courses

### Neutral Impacts
1. **API Changes**: All endpoints updated to include course context (acceptable with clean slate)
2. **Database Schema**: Simple addition of Course table and courseId foreign key

### Considerations
1. **Frontend Updates**: All navigation and views need to show course context
2. **Learning Curve**: Users will need to adapt to new URL structure
3. **Seeding**: Initial course data needs to be populated

## Open Questions

1. Should course names be strictly limited to the dance styles, or should we allow custom course names?
   - Decision: Course names will map to dance styles but we'll allow descriptive names (e.g., "Mambo on2 - Advanced Techniques")

2. Should we add a course image/thumbnail field for visual identification?
   - Decision: Not in this iteration - can be added later as needed

3. Should courses have an active/inactive state?
   - Decision: Not in this iteration - can be added via description field or separate field later

## Acceptance Criteria

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

## Related Issues

- TBD: Issue numbers for implementation tasks