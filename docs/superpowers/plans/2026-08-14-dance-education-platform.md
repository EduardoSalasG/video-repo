# Dance Education Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a web-based dance education platform for organizing and searching dance tutorial videos with granular metadata about steps, sequences, and techniques, focused on Mambo On2 NY style, Casino, and Sensual Bachata.

**Architecture:** RESTful API with PostgreSQL database using Prisma ORM, JWT authentication, role-based access control (admin/instructor/student), hierarchical content organization (Modules → Sections → Video+Markdown), dance-specific video metadata (steps, difficulty, style, influences), search/filtering capabilities, and progress tracking.

**Tech Stack:** Node.js, TypeScript, Express.js, PostgreSQL, Prisma ORM, JWT, bcrypt, Zod validation, Vitest testing, ESLint, Prettier

**Spec:** /mnt/c/Users/salas/Documents/video-repo/context/specs/dance-education-platform-spec.md

## Global Constraints
- TypeScript 5.x
- Node.js 20.x LTS
- PostgreSQL database required
- JWT for authentication
- Role-based access: admin, instructor, student
- RESTful API design
- Validate all inputs with Zod
- Use Prisma ORM for database access
- Write unit and integration tests with Vitest
- Follow existing code style (single quotes, no semicolons via Prettier)
- All async functions must handle errors
- Explicit error handling with custom error types
- Small, focused commits with Conventional Commits

---
## File Structure

```
src/
├── index.ts                  # Application entry point
├── config/
│   ├── database.ts           # Prisma client configuration
│   └── validation.ts         # Zod schemas and validation helpers
├ ├── middleware/
│   ├── auth.ts               # JWT authentication middleware
│   ├── errorHandler.ts       # Centralized error handling
│   └── role.ts               # Role-based access control middleware
├── routes/
│   ├── authRoutes.ts         # Authentication endpoints
│   ├── moduleRoutes.ts       # Module CRUD endpoints
│   ├── sectionRoutes.ts      # Section CRUD endpoints
│   ├── videoRoutes.ts        # Video upload and metadata endpoints
│   ├── contentRoutes.ts      # Markdown content endpoints
│   ├── searchRoutes.ts       # Search and filtering endpoints
│   └── progressRoutes.ts     # Progress tracking endpoints
├── controllers/
│   ├── authController.ts     # Authentication logic
│   ├── moduleController.ts   # Module business logic
│   ├── sectionController.ts  # Section business logic
│   ├── videoController.ts    # Video upload and metadata logic
│   ├── contentController.ts  # Markdown content logic
│   ├── searchController.ts   # Search and filtering logic
│   └── progressController.ts # Progress tracking logic
├── models/
│   ├── user.ts               # User entity and methods
│   ├── session.ts            # Session entity for magic-link
│   ├── module.ts             # Module entity and methods
│   ├── section.ts            # Section entity and methods
│   ├── videoMetadata.ts      # Video metadata entity and methods
│   └── userProgress.ts       # User progress entity and methods
├── utils/
│   ├── password.ts           # Password hashing and verification
│   ├── token.ts              # JWT token generation and verification
│   ├── videoProcessor.ts     # Video metadata extraction (ffmpeg)
│   └── storage.ts            # Storage abstraction (local/S3)
├── types/
│   ├── index.ts              # Shared TypeScript interfaces
│   └── enums.ts              # Enums for difficulty, styles, etc.
�������└── validators/
    ├── authValidators.ts     # Zod schemas for auth
    ├── moduleValidators.ts   # Zod schemas for modules
    ├── sectionValidators.ts  # Zod schemas for sections
    ├── videoValidators.ts    # Zod schemas for video metadata
    └── progressValidators.ts # Zod schemas for progress

prisma/
├── schema.prisma             # Prisma database schema
�������└── migrations/               # Migration files

tests/
├── unit/
│   ├── auth.test.ts
│   ├── module.test.ts
│   ├── section.test.ts
│   ├── video.test.ts
│   ├── content.test.ts
│   ├── search.test.ts
│   └── progress.test.ts
├── integration/
│   ├── auth.integration.test.ts
│   ├── moduleSection.integration.test.ts
│   ├── videoMetadata.integration.test.ts
│   ├── search.integration.test.ts
│   └── progress.integration.test.ts
�������└── setup.ts                  # Test setup and teardown

docs/
├── api.md                    # API documentation
�������└── schema.md                 # Database schema documentation
```

---

## Implementation Tasks

### Phase 0: Project Setup and Foundation

#### Task 0: Initialize Project Structure
**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `.eslintrc.js`
- Create: `.prettierrc`
- Create: `src/index.ts`
- Create: `prisma/schema.prisma`
- Create: `tests/setup.ts`

**Steps:**
- [ ] **Step 1: Initialize npm project**
  ```bash
  npm init -y
  ```
- [ ] **Step 2: Install core dependencies**
  ```bash
  npm install express typescript @types/node @types/express
  ```
- [ ] **Step 3: Install dev dependencies**
  ```bash
  npm install -D ts-node-dev @types/jest vitest eslint prettier @typescript-eslint/eslint-plugin @typescript-eslint/parser
  ```
- [ ] **Step 4: Configure TypeScript**
  ```json
  {
    "compilerOptions": {
      "target": "ES2020",
      "module": "commonjs",
      "lib": ["ES2020"],
      "outDir": "./dist",
      "rootDir": "./src",
      "strict": true,
      "esModuleInterop": true,
      "skipLibCheck": true,
      "forceConsistentCasingInFileNames": true,
      "declaration": true,
      "outFile": "./dist/app.js",
      "removeComments": true,
      "noImplicitAny": true,
      "strictNullChecks": true,
      "strictFunctionTypes": true,
      "noImplicitThis": true,
      "noImplicitReturns": true,
      "noFallthroughCasesInSwitch": true,
      "moduleResolution": "node",
      "baseUrl": "./",
      "paths": {
        "*": ["node_modules/*", "src/types/*"]
      }
    }
  }
  ```
- [ ] **Step 5: Configure ESLint and Prettier**
- [ ] **Step 6: Create basic Express server in src/index.ts**
- [ ] **Step 7: Commit foundation**

#### Task 1: Database Setup with Prisma
**Files:**
- Create: `prisma/schema.prisma`
- Modify: `package.json` (add prisma dev dependency)
- Create: `src/config/database.ts`

**Steps:**
- [ ] **Step 1: Install Prisma**
  ```bash
  npm install prisma @prisma/client
  npm install -D prisma
  ```
- [ ] **Step 2: Initialize Prisma**
  ```bash
  npx prisma init
  ```
- [ ] **Step 3: Define database schema in prisma/schema.prisma**
  ```prisma
  // User model
  model User {
    id        String   @id @default(uuid())
    email     String   @unique
    username  String   @unique
    firstName String
    lastName  String
    role      Role     @default(STUDENT)
    passwordHash String
    sessions  Session[]
    progress  UserProgress[]
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt
  }

  // Session for magic-link
  model Session {
    id        String   @id @default(uuid())
    token     String   @unique
    userId    String
    user      User     @relation(fields: [userId], references: [id])
    expiresAt DateTime
    usedAt    DateTime?
    createdAt DateTime @default(now())
  }

  // Module model
  model Module {
    id            String   @id @default(uuid())
    title         String
    description   String?
    orderIndex    Int      @default(0)
    sections      Section[]
    createdAt     DateTime @default(now())
    updatedAt     DateTime @updatedAt
  }

  // Section model
  model Section {
    id            String   @id @default(uuid())
    moduleId      String
    module        Module   @relation(fields: [moduleId], references: [id])
    title         String
    description   String?
    orderIndex    Int      @default(0)
    videoUrl      String?
    markdownContent String?
    videoMetadata VideoMetadata?
    progress      UserProgress[]
    createdAt     DateTime @default(now())
    updatedAt     DateTime @updatedAt
  }

  // Video metadata model
  model VideoMetadata {
    id            String   @id @default(uuid())
    sectionId     String   @unique
    section       Section  @relation(fields: [sectionId], references: [id])
    steps         Json[]
    difficulty    Difficulty
    primaryStyle  PrimaryStyle
    influences    Json[]
    durationCounts Int
    videoType     VideoType
    tags          Json[]
    fileSize      Int?
    durationSeconds Int?
    filename      String?
    createdAt     DateTime @default(now())
    updatedAt     DateTime @updatedAt
  }

  // User progress model
  model UserProgress {
    id              String   @id @default(uuid())
    userId          String
    user            User     @relation(fields: [userId], references: [id])
    sectionId       String
    section         Section  @relation(fields: [sectionId], references: [id])
    completedAt     DateTime?
    lastPositionSeconds Int?
    updatedAt       DateTime @updatedAt

    @@unique([userId, sectionId])
  }

  // Enums
  enum Role {
    ADMIN
    INSTRUCTOR
    STUDENT
  }

  enum Difficulty {
    BEGINNER
    INTERMEDIATE
    ADVANCED
  }

  enum PrimaryStyle {
    MAMBO_ON2
    CASINO
    SENSUAL_BACHATA
  }

  enum VideoType {
    STEP_BREAKDOWN
    COMBINATION
    FULL_PATTERN
    SHINES_SEQUENCE
  }
  ```
- [ ] **Step 4: Generate Prisma client**
  ```bash
  npx prisma generate
  ```
- [ ] **Step 5: Create database.ts to export Prisma client**
- [ ] **Step 6: Commit database setup**

### Phase 1: Authentication System

#### Task 2: Password Utilities
**Files:**
- Create: `src/utils/password.ts`

**Steps:**
- [ ] **Step 1: Install bcrypt**
  ```bash
  npm install bcrypt
  npm install -D @types/bcrypt
  ```
- [ ] **Step 2: Implement password hashing and verification functions**
- [ ] **Step 3: Write unit tests**
- [ ] **Step 4: Commit**

#### Task 3: Token Utilities
**Files:**
- Create: `src/utils/token.ts`

**Steps:**
- [ ] **Step 1: Install jsonwebtoken**
  ```bash
  npm install jsonwebtoken
  npm install -D @types/jsonwebtoken
  ```
- [ ] **Step 2: Implement JWT generation and verification**
- [ ] **Step 3: Write unit tests**
- [ ] **Step 4: Commit**

#### Task 4: Authentication Middleware
**Files:**
- Create: `src/middleware/auth.ts`
- Create: `src/middleware/role.ts`
- Create: `src/middleware/errorHandler.ts`

**Steps:**
- [ ] **Step 1: Implement JWT authentication middleware**
- [ ] **Step 2: Implement role-based access control middleware**
- [ ] **Step 3: Implement centralized error handling**
- [ ] **Step 4: Write unit tests**
- [ ] **Step 5: Commit**

#### Task 5: Auth Controller
**Files:**
- Create: `src/controllers/authController.ts`
- Create: `src/validators/authValidators.ts`
- Create: `src/types/index.ts` (shared interfaces)
- Create: `src/types/enums.ts`

**Steps:**
- [ ] **Step 1: Define TypeScript interfaces and enums**
- [ ] **Step 2: Create Zod validation schemas for auth**
- [ ] **Step 3: Implement register endpoint logic**
- [ ] **Step 4: Implement login endpoint logic**
- [ ] **Step 5: Implement magic-link endpoint logic**
- [ ] **Step 6: Write unit tests**
- [ ] **Step 7: Commit**

#### Task 6: Auth Routes
**Files:**
- Create: `src/routes/authRoutes.ts`
- Modify: `src/index.ts` (add routes middleware)

**Steps:**
- [ ] **Step 1: Set up Express router for auth endpoints**
- [ ] **Step 2: Connect controllers to routes**
- [ ] **Step 3: Apply validation middleware**
- [ ] **Step 4: Write integration tests**
- [ ] **Step 5: Commit**

### Phase 2: Content Management (Modules and Sections)

#### Task 7: Module Model and Controller
**Files:**
- Create: `src/models/module.ts`
- Create: `src/controllers/moduleController.ts`
- Create: `src/validators/moduleValidators.ts`

**Steps:**
- [ ] **Step 1: Implement Module model methods (find, create, update, delete)**
- [ ] **Step 2: Create Zod validation schemas for modules**
- [ ] **Step 3: Implement controller logic for module CRUD**
- [ ] **Step 4: Write unit tests**
- [ ] **Step 5: Commit**

#### Task 8: Module Routes
**Files:**
- Create: `src/routes/moduleRoutes.ts`

**Steps:**
- [ ] **Step 1: Set up Express router for module endpoints**
- [ ] **Step 2: Apply authentication and role middleware**
- [ ] **Step 3: Connect controller to routes**
- [ ] **Step 4: Write integration tests**
- [ ] **Step 5: Commit**

#### Task 9: Section Model and Controller
**Files:**
- Create: `src/models/section.ts`
- Create: `src/controllers/sectionController.ts`
- Create: `src/validators/sectionValidators.ts`

**Steps:**
- [ ] **Step 1: Implement Section model methods**
- [ ] **Step 2: Create Zod validation schemas for sections**
- [ ] **Step 3: Implement controller logic for section CRUD**
- [ ] **Step 4: Write unit tests**
- [ ] **Step 5: Commit**

#### Task 10: Section Routes
**Files:**
- Create: `src/routes/sectionRoutes.ts`

**Steps:**
- [ ] **Step 1: Set up Express router for section endpoints (nested under modules)**
- [ ] **Step 2: Apply authentication and role middleware**
- [ ] **Step 3: Connect controller to routes**
- [ ] **Step 4: Write integration tests**
- [ ] **Step 5: Commit**

### Phase 3: Video and Content Features

#### Task 11: Video Metadata Model and Controller
**Files:**
- Create: `src/models/videoMetadata.ts`
- Create: `src/controllers/videoController.ts`
- Create: `src/validators/videoValidators.ts`

**Steps:**
- [ ] **Step 1: Implement VideoMetadata model methods**
- [ ] **Step 2: Create Zod validation schemas for video metadata**
- [ ] **Step 3: Implement controller logic for video metadata**
- [ ] **Step 4: Write unit tests**
- [ ] **Step 5: Commit**

#### Task 12: Video Upload and Processing
**Files:**
- Create: `src/utils/videoProcessor.ts`
- Create: `src/utils/storage.ts`
- Modify: `src/routes/videoRoutes.ts` (create file)
- Create: `src/controllers/videoController.ts` (add upload method)

**Steps:**
- [ ] **Step 1: Install multer for file uploads**
  ```bash
  npm install multer
  npm install -D @types/multer
  ```
- [ ] **Step 2: Install fluent-ffmpeg for video processing**
  ```bash
  npm install fluent-ffmpeg
  npm install -D @types/fluent-ffmpeg
  ```
- [ ] **Step 3: Implement storage abstraction (local filesystem)**
- [ ] **Step 4: Implement video metadata extraction (duration, file size)**
- [ ] **Step 5: Create upload endpoint**
- [ ] **Step 6: Write unit tests**
- [ ] **Step 7: Commit**

#### Task 13: Video Routes
**Files:**
- Create: `src/routes/videoRoutes.ts`

**Steps:**
- [ ] **Step 1: Set up Express router for video endpoints**
- [ ] **Step 2: Apply authentication and role middleware**
- [ ] **Step 3: Connect controller to routes**
- [ ] **Step 4: Write integration tests**
- [ ] **Step 5: Commit**

#### Task 14: Content (Markdown) Controller and Routes
**Files:**
- Create: `src/controllers/contentController.ts`
- Create: `src/routes/contentRoutes.ts`

**Steps:**
- [ ] **Step 1: Implement markdown content get/update logic**
- [ ] **Step 2: Create routes for content endpoints**
- [ ] **Step 3: Apply authentication and role middleware**
- [ ] **Step 4: Write unit and integration tests**
- [ ] **Step 5: Commit**

### Phase 4: Search and Progress Features

#### Task 15: Search Controller and Routes
**Files:**
- Create: `src/controllers/searchController.ts`
- Create: `src/routes/searchRoutes.ts`

**Steps:**
- [ ] **Step 1: Implement search logic with filtering**
- [ ] **Step 2: Build dynamic SQL queries based on filters**
- [ ] **Step 3: Create search endpoint with pagination**
- [ ] **Step 4: Write unit and integration tests**
- [ ] **Step 5: Commit**

#### Task 16: Progress Model and Controller
**Files:**
- Create: `src/models/userProgress.ts`
- Create: `src/controllers/progressController.ts`
- Create: `src/validators/progressValidators.ts`

**Steps:**
- [ ] **Step 1: Implement UserProgress model methods**
- [ ] **Step 2: Create Zod validation schemas for progress**
- [ ] **Step 3: Implement controller logic for progress tracking**
- [ ] **Step 4: Write unit tests**
- [ ] **Step 5: Commit**

#### Task 17: Progress Routes
**Files:**
- Create: `src/routes/progressRoutes.ts`

**Steps:**
- [ ] **Step 1: Set up Express router for progress endpoints**
- [ ] **Step 2: Apply authentication middleware**
- [ ] **Step 3: Connect controller to routes**
- [ ] **Step 4: Write integration tests**
- [ ] **Step 5: Commit**

### Phase 5: Testing, Documentation, and Refinement

#### Task 18: API Documentation
**Files:**
- Create: `docs/api.md`
- Create: `docs/schema.md`

**Steps:**
- [ ] **Step 1: Document all API endpoints with examples**
- [ ] **Step 2: Document database schema**
- [ ] **Step 3: Commit documentation**

#### Task 19: Test Suite Completion
**Files:**
- Modify: Various test files throughout implementation

**Steps:**
- [ ] **Step 1: Ensure >80% test coverage on critical paths**
- [ ] **Step 2: Run integration tests for full user flows**
- [ ] **Step 3: Fix any failing tests**
- [ ] **Step 2: Commit**

#### Task 20: Final Integration and Deployment Prep
**Files:**
- Modify: `package.json` (add scripts)
- Create: `Dockerfile` (optional)
- Create: `.github/workflows/ci.yml` (optional)

**Steps:**
- [ ] **Step 1: Add npm scripts for dev, build, test, start**
- [ ] **Step 2: Run full test suite**
- [ ] **Step 3: Perform manual API testing**
- [ ] **Step 4: Commit final code**
- [ ] **Step 5: Tag release v1.0.0**

## Execution Handoff

**Plan complete and saved to `/mnt/c/Users/salas/Documents/video-repo/docs/superpowers/plans/2026-08-14-dance-education-platform.md`. Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**