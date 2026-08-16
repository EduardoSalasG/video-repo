# Feature Specification: Dance Education Platform

**Status**: Draft
**Owner**: implementer
**Created**: 2026-08-14
**Updated**: 2026-08-14

## Problem Statement
Dance instructors and students need a platform to organize, categorize, and search dance tutorial videos with granular metadata about steps, sequences, and techniques. Current video platforms lack the specificity needed for dance education, particularly for tracking step sequences, influences, and difficulty levels across different dance styles (Mambo On2 NY style, Casino, Sensual Bachata).

## Goals
- Create a hierarchical content organization system (Modules → Sections → Video+Markdown)
- Enable detailed dance-specific metadata tagging (steps, sequences, difficulty, style, influences)
- Support multi-user roles (admin, instructor, student) with appropriate permissions
- Provide search and filtering capabilities based on dance-specific criteria
- Track student progress and completion status
- Allow markdown-based explanations alongside videos
- Design for easy scaling from local storage to cloud storage

## Non-Goals
- Live streaming or real-time video conferencing
- Social networking features (comments, likes, follows)
- Payment processing or monetization features
- Advanced video editing capabilities
- Mobile app development (initial web-only focus)

## User Stories
1. As an admin, I want to manage users and roles so that I can control platform access
2. As an instructor, I want to create modules and sections so that I can organize my dance curriculum
3. As an instructor, I want to upload videos and add detailed step metadata so that students can learn specific techniques
4. As an instructor, I want to add markdown explanations so that I can provide context and instructions for videos
5. As a student, I want to browse and search content by style, difficulty, and steps so that I can find relevant lessons
6. As a student, I want to track my progress so that I can see what I've completed and resume where I left off
7. As an instructor, I want to view class progress so that I can identify areas where students need help

## API Contract

### Authentication
#### POST /auth/register
**Request**:
```json
{
  "email": "string",
  "username": "string", 
  "firstName": "string",
  "lastName": "string",
  "password": "string"
}
```
**Response** (201):
```json
{
  "accessToken": "string",
  "user": {
    "id": "string",
    "email": "string",
    "username": "string",
    "firstName": "string",
    "lastName": "string",
    "role": "admin|instructor|student"
  }
}
```

#### POST /auth/login
**Request**:
```json
{
  "emailOrUsername": "string",
  "password": "string"
}
```
**Response** (200):
```json
{
  "accessToken": "string",
  "user": {
    "id": "string",
    "email": "string",
    "username": "string",
    "firstName": "string",
    "lastName": "string",
    "role": "admin|instructor|student"
  }
}
```

### Modules
#### GET /modules
**Query**: `page?: number, limit?: number, search?: string`
**Response** (200):
```json
{
  "modules": [{
    "id": "string",
    "title": "string",
    "description": "string",
    "orderIndex": number,
    "sectionCount": number,
    "createdAt": "string",
    "updatedAt": "string"
  }],
  "pagination": {
    "page": number,
    "limit": number,
    "total": number,
    "pages": number
  }
}
```

#### POST /modules
**Request**:
```json
{
  "title": "string",
  "description": "string",
  "orderIndex?: number"
}
```
**Response** (201):
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "orderIndex": number,
  "createdAt": "string",
  "updatedAt": "string"
}
```

#### GET /modules/:id
**Response** (200):
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "orderIndex": number,
  "sections": [{
    "id": "string",
    "title": "string",
    "description": "string",
    "orderIndex": number,
    "videoUrl": "string|null",
    "hasMarkdown": boolean,
    "createdAt": "string",
    "updatedAt": "string"
  }],
  "createdAt": "string",
  "updatedAt": "string"
}
```

#### PATCH /modules/:id
**Request**:
```json
{
  "title?: string",
  "description?: string",
  "orderIndex?: number"
}
```
**Response** (200): Updated module object

#### DELETE /modules/:id
**Response** (204): No content

### Sections
#### GET /modules/:moduleId/sections
**Query**: `page?: number, limit?: number`
**Response** (200):
```json
{
  "sections": [{
    "id": "string",
    "title": "string",
    "description": "string",
    "orderIndex": number,
    "videoUrl": "string|null",
    "markdownContent": "string|null",
    "hasMetadata": boolean,
    "createdAt": "string",
    "updatedAt": "string"
  }],
  "pagination": {
    "page": number,
    "limit": number,
    "total": number,
    "pages": number
  }
}
```

#### POST /modules/:moduleId/sections
**Request**:
```json
{
  "title": "string",
  "description": "string",
  "orderIndex?: number"
}
```
**Response** (201):
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "orderIndex": number,
  "moduleId": "string",
  "createdAt": "string",
  "updatedAt": "string"
}
```

#### GET /modules/:moduleId/sections/:sectionId
**Response** (200):
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "orderIndex": number,
  "moduleId": "string",
  "videoUrl": "string|null",
  "markdownContent": "string|null",
  "metadata": {
    "steps": [{
      "name": "string",
      "counts": number,
      "variation?: string",
      "notes?: string"
    }],
    "difficulty": "beginner|intermediate|advanced",
    "primaryStyle": "mambo_on2|casino|sensual_bachata",
    "influences": string[],
    "durationCounts": number,
    "videoType": "step_breakdown|combination|full_pattern|shines_sequence",
    "tags": string[],
    "fileSize?: number",
    "durationSeconds?: number",
    "filename?: string"
  }|null,
  "createdAt": "string",
  "updatedAt": "string"
}
```

#### PATCH /modules/:moduleId/sections/:sectionId
**Request**:
```json
{
  "title?: string",
  "description?: string",
  "orderIndex?: number"
}
```
**Response** (200): Updated section object

#### DELETE /modules/:moduleId/sections/:sectionId
**Response** (204): No content

### Video Upload & Metadata
#### POST /modules/:moduleId/sections/:sectionId/upload
**Request**: multipart/form-data with `video` file field
**Response** (200):
```json
{
  "videoUrl": "string",
  "fileSize": number,
  "durationSeconds": number
}
```

#### PATCH /modules/:moduleId/sections/:sectionId/metadata
**Request**:
```json
{
  "steps": [{
    "name": "string",
    "counts": number,
    "variation?: string",
    "notes?: string"
  }],
  "difficulty": "beginner|intermediate|advanced",
  "primaryStyle": "mambo_on2|casino|sensual_bachata",
  "influences": string[],
  "durationCounts": number,
  "videoType": "step_breakdown|combination|full_pattern|shines_sequence",
  "tags": string[],
  "durationSeconds?: number",
  "fileSize?: number"
}
```
**Response** (200):
```json
{
  "id": "string",
  "sectionId": "string",
  "steps": [{
    "name": "string",
    "counts": number,
    "variation?: string",
    "notes?: string"
  }],
  "difficulty": "beginner|intermediate|advanced",
  "primaryStyle": "mambo_on2|casino|sensual_bachata",
  "influences": string[],
  "durationCounts": number,
  "videoType": "step_breakdown|combination|full_pattern|shines_sequence",
  "tags": string[],
  "fileSize?: number",
  "durationSeconds?: number",
  "filename?: string",
  "createdAt": "string",
  "updatedAt": "string"
}
```

#### GET /modules/:moduleId/sections/:sectionId/metadata
**Response** (200): Metadata object (or 404 if not set)

### Content (Markdown)
#### PATCH /modules/:moduleId/sections/:sectionId/content
**Request**:
```json
{
  "markdownContent": "string"
}
```
**Response** (200):
```json
{
  "sectionId": "string",
  "markdownContent": "string",
  "updatedAt": "string"
}
```

#### GET /modules/:moduleId/sections/:sectionId/content
**Response** (200):
```json
{
  "sectionId": "string",
  "markdownContent": "string|null",
  "updatedAt": "string"
}
```

### Search & Filtering
#### GET /search
**Query**:
```text
q?: string              // text search in title/description/content
moduleId?: string       // filter by module
difficulty?: beginner|intermediate|advanced
primaryStyle?: mambo_on2|casino|sensual_bachata
influences?: string     // comma-separated, matches any
steps?: string          // comma-separated, must contain all
videoType?: step_breakdown|combination|full_pattern|shines_sequence
tags?: string           // comma-separated, matches any
durationCountsMin?: number
durationCountsMax?: number
page?: number
limit?: number
sort?: title|createdAt|difficulty  // prefix with - for desc (e.g., -title)
```
**Response** (200):
```json
{
  "sections": [{
    "id": "string",
    "title": "string",
    "description": "string",
    "moduleId": "string",
    "moduleTitle": "string",
    "videoUrl": "string|null",
    "markdownContent": "string|null",
    "metadata": {
      "steps": [{ "name": "string", "counts": number }],
      "difficulty": "beginner|intermediate|advanced",
      "primaryStyle": "mambo_on2|casino|sensual_bachata",
      "influences": string[],
      "durationCounts": number,
      "videoType": "step_breakdown|combination|full_pattern|shines_sequence",
      "tags": string[]
    }|null,
    "createdAt": "string",
    "updatedAt": "string"
  }],
  "pagination": {
    "page": number,
    "limit": number,
    "total": number,
    "pages": number
  }
}
```

### Progress Tracking
#### POST /progress
**Request**:
```json
{
  "sectionId": "string",
  "completed": boolean,
  "positionSeconds?: number"
}
```
**Response** (200):
```json
{
  "id": "string",
  "userId": "string",
  "sectionId": "string",
  "completedAt": "string|null",
  "lastPositionSeconds": number|null,
  "updatedAt": "string"
}
```

#### GET /progress/:sectionId
**Response** (200):
```json
{
  "id": "string",
  "userId": "string",
  "sectionId": "string",
  "completedAt": "string|null",
  "lastPositionSeconds": number|null,
  "updatedAt": "string"
}
```

#### GET /users/:userId/progress
**Response** (200):
```json
{
  "progress": [{
    "id": "string",
    "sectionId": "string",
    "sectionTitle": "string",
    "moduleTitle": "string",
    "completedAt": "string|null",
    "lastPositionSeconds": number|null,
    "updatedAt": "string"
  }]
}
```

## Data Model

### User
```typescript
interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'instructor' | 'student';
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Session (for magic-link)
```typescript
interface Session {
  id: string;
  token: string;
  userId: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
}
```

### Module
```typescript
interface Module {
  id: string;
  title: string;
  description: string;
  orderIndex: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### Section
```typescript
interface Section {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  orderIndex: number;
  videoUrl: string | null;
  markdownContent: string | null;
  createdAt: Date;
  updatedAt: Date;
}
```

### VideoMetadata
```typescript
interface VideoMetadata {
  id: string;
  sectionId: string; // one-to-one with Section
  steps: Array<{
    name: string;
    counts: number;
    variation?: string;
    notes?: string;
  }>;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  primaryStyle: 'mambo_on2' | 'casino' | 'sensual_bachata';
  influences: string[];
  durationCounts: number; // total counts in video
  videoType: 'step_breakdown' | 'combination' | 'full_pattern' | 'shines_sequence';
  tags: string[];
  fileSize?: number; // bytes
  durationSeconds?: number;
  filename?: string; // original filename
  createdAt: Date;
  updatedAt: Date;
}
```

### UserProgress
```typescript
interface UserProgress {
  id: string;
  userId: string;
  sectionId: string;
  completedAt: Date | null;
  lastPositionSeconds: number | null;
  updatedAt: Date;
}
```

## Acceptance Criteria
- [ ] Users can register, login, and use magic-link authentication
- [ ] Admins can manage users and roles
- [ ] Instructors can create, read, update, delete modules and sections
- [ ] Students can only read modules and sections (no write access)
- [ ] Instructors can upload videos and extract basic metadata (size, duration)
- [ ] Instructors can add detailed dance-specific metadata (steps, difficulty, style, influences, etc.)
- [ ] Instructors can add markdown explanations to sections
- [ ] Students and instructors can search content by text, style, difficulty, steps, influences, tags
- [ ] Students can track their progress (completion status and resume position)
- [ ] Instructors can view progress reports for their sections/modules
- [ ] API returns appropriate HTTP status codes (200, 201, 204, 400, 401, 403, 404, 422, 500)
- [ ] Validation errors return detailed error messages
- [ ] All protected routes require authentication
- [ ] Role-based access control is enforced on all endpoints

## Edge Cases
- Uploading non-video files or corrupted video files
- Sections with no video or markdown content
- Search queries with no results
- Concurrent updates to the same section metadata
- Users attempting to access resources they don't have permission for
- Very long step sequences or tag arrays
- Special characters in step names, titles, or markdown content
- Deleting a module that still contains sections
- Deleting a section that has user progress records
- Magic-link token expiration and reuse prevention
- Handling large video files during upload (streaming, timeouts)

## Dependencies
- PostgreSQL database (with JSONB support)
- Prisma ORM (for TypeScript database access)
- JWT library (for authentication)
- Bcrypt or Argon2 (for password hashing)
- Video metadata extraction library (like fluent-ffmpeg or similar)
- Storage adapter (local filesystem with interface for S3/cloud)
- Validation library (Zod or Joi)
- Testing: Vitest, Supertest (for API testing)
- Linting: ESLint, Prettier
- TypeScript 5.x

## Testing Requirements
- Unit tests for:
  - Auth service (registration, login, magic-link)
  - User role and permission checking
  - Video metadata validation
  - Search query building
  - Progress calculation
- Integration tests for:
  - Full auth flow (register → login → access protected route)
  - Module and section CRUD operations
  - Video upload and metadata association
  - Search and filtering with various combinations
  - Progress tracking updates and retrieval
  - Role-based access enforcement
- E2E tests for:
  - Instructor creating content flow (module → section → upload video → add metadata → add markdown)
  - Student learning flow (search → watch video → track progress → mark complete)
  - Admin user management flow
  - Magic-link authentication flow

## Rollout Plan
1. **Phase 1: Core API & Auth**
   - Implement user authentication (register, login, magic-link)
   - Create basic user and session models
   - Set up API server with middleware
   
2. **Phase 2: Content Management**
   - Implement modules and sections CRUD
   - Add video upload endpoint (local storage)
   - Add markdown content endpoints
   
3. **Phase 3: Dance-Specific Metadata**
   - Implement video metadata model and endpoints
   - Add validation for step sequences and dance-specific fields
   
4. **Phase 4: Search & Progress**
   - Implement search and filtering endpoints
   - Implement progress tracking system
   
5. **Phase 5: Testing & Refinement**
   - Write comprehensive test suite
   - Perform security audit (authentication, authorization)
   - Optimize database queries and indexes
   - Add documentation and examples
   
6. **Phase 6: Scaling Preparation**
   - Abstract storage layer for easy cloud migration
   - Add caching layer for frequent queries
   - Prepare deployment configurations (Docker, CI/CD)

## Monitoring
- API response times and error rates
- Authentication success/failure rates
- Video upload success rates and file sizes
- Search query performance
- Active user counts and session durations
- Storage usage and growth
- Progress completion rates