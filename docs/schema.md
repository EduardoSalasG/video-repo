# Dance Education Platform — Database Schema

This document describes the database schema defined in `prisma/schema.prisma`. The datasource is **PostgreSQL** with Prisma ORM.

## Conventions

- All models have a `String` `id` that defaults to a `uuid()`.
- `createdAt` defaults to the current time; `updatedAt` is automatically managed by Prisma (`@updatedAt`).
- Timestamps are stored as `DateTime` (PostgreSQL `timestamp with time zone`).
- Optional fields are marked with `?`.
- JSON fields (`steps`, `influences`, `tags`) are stored as `Json[]` arrays.

## Entity Relationship Overview

```
User 1 ── N Session
User 1 ── N UserProgress
Module 1 ── N Section
Section 1 ── 1 VideoMetadata   (one-to-one, sectionId is unique)
Section 1 ── N UserProgress
User N ── N Section            (through UserProgress, unique per [userId, sectionId])
```

## Models

### User

Represents a platform user (student, instructor, or admin).

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `String` | `@id` | UUID primary key |
| `email` | `String` | `@unique` | Unique email address |
| `username` | `String` | `@unique` | Unique username |
| `firstName` | `String` | | |
| `lastName` | `String` | | |
| `role` | `Role` | `@default(STUDENT)` | User role |
| `passwordHash` | `String` | | Argon2/bcrypt-style hash, never returned by the API |
| `sessions` | `Session[]` | relation | Magic-link sessions belonging to this user |
| `progress` | `UserProgress[]` | relation | Progress records for this user |
| `createdAt` | `DateTime` | `@default(now())` | |
| `updatedAt` | `DateTime` | `@updatedAt` | |

**Relations**:

- `sessions` → `Session.user` (one-to-many)
- `progress` → `UserProgress.user` (one-to-many)

---

### Session

One-time authentication session created by `POST /auth/magic-link` (token expires after 1 hour).

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `String` | `@id` | UUID primary key |
| `token` | `String` | `@unique` | Magic-link token |
| `userId` | `String` | | Foreign key to `User.id` |
| `user` | `User` | `@relation(fields: [userId], references: [id])` | Owning user |
| `expiresAt` | `DateTime` | | Expiration timestamp |
| `usedAt` | `DateTime?` | | When the session was consumed (if at all) |
| `createdAt` | `DateTime` | `@default(now())` | |

**Relations**:

- `user` → `User.sessions` (many-to-one, FK `userId` → `User.id`)

---

### Module

Top-level grouping of curriculum content (e.g. "Mambo On2 Fundamentals").

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `String` | `@id` | UUID primary key |
| `title` | `String` | | Module title |
| `description` | `String?` | | Optional description |
| `orderIndex` | `Int` | `@default(0)` | Display order (ascending) |
| `sections` | `Section[]` | relation | Sections contained in this module |
| `createdAt` | `DateTime` | `@default(now())` | |
| `updatedAt` | `DateTime` | `@updatedAt` | |

**Relations**:

- `sections` → `Section.module` (one-to-many)

---

### Section

A lesson within a module, optionally backed by a video and markdown content.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `String` | `@id` | UUID primary key |
| `moduleId` | `String` | | Foreign key to `Module.id` |
| `module` | `Module` | `@relation(fields: [moduleId], references: [id])` | Parent module |
| `title` | `String` | | Section title |
| `description` | `String?` | | Optional description |
| `orderIndex` | `Int` | `@default(0)` | Display order within the module (ascending) |
| `videoUrl` | `String?` | | URL of the section video (if set) |
| `markdownContent` | `String?` | | Markdown explanation/notes |
| `videoMetadata` | `VideoMetadata?` | relation | The section's video metadata (at most one) |
| `progress` | `UserProgress[]` | relation | Progress records for this section |
| `createdAt` | `DateTime` | `@default(now())` | |
| `updatedAt` | `DateTime` | `@updatedAt` | |

**Relations**:

- `module` → `Module.sections` (many-to-one, FK `moduleId` → `Module.id`)
- `videoMetadata` → `VideoMetadata.section` (one-to-one; `VideoMetadata.sectionId` is unique)
- `progress` → `UserProgress.section` (one-to-many)

---

### VideoMetadata

Dance-specific metadata attached to a section's video. A section has **at most one** record.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `String` | `@id` | UUID primary key |
| `sectionId` | `String` | `@unique` | Foreign key to `Section.id` (one-to-one) |
| `section` | `Section` | `@relation(fields: [sectionId], references: [id])` | Owning section |
| `steps` | `Json[]` | | Ordered list of dance steps |
| `difficulty` | `Difficulty` | | Difficulty level |
| `primaryStyle` | `PrimaryStyle` | | Primary dance style |
| `influences` | `Json[]` | | Stylistic influences |
| `durationCounts` | `Int` | | Number of counts/measures |
| `videoType` | `VideoType` | | Type of video content |
| `tags` | `Json[]` | | Searchable tags |
| `fileSize` | `Int?` | | File size in bytes (set on upload) |
| `durationSeconds` | `Int?` | | Video duration in seconds (set on upload) |
| `filename` | `String?` | | Stored filename on disk |
| `createdAt` | `DateTime` | `@default(now())` | |
| `updatedAt` | `DateTime` | `@updatedAt` | |

**Relations**:

- `section` → `Section.videoMetadata` (one-to-one, FK `sectionId` → `Section.id`)

---

### UserProgress

Tracks an individual user's progress on a section (one record per user/section pair).

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `String` | `@id` | UUID primary key |
| `userId` | `String` | | Foreign key to `User.id` |
| `user` | `User` | `@relation(fields: [userId], references: [id])` | Owning user |
| `sectionId` | `String` | | Foreign key to `Section.id` |
| `section` | `Section` | `@relation(fields: [sectionId], references: [id])` | Progressed section |
| `completedAt` | `DateTime?` | | When the section was completed (if at all) |
| `lastPositionSeconds` | `Int?` | | Resume position in seconds |
| `updatedAt` | `DateTime` | `@updatedAt` | |
| `(composite)` | — | `@@unique([userId, sectionId])` | Enforces one progress record per user+section |

**Relations**:

- `user` → `User.progress` (many-to-one, FK `userId` → `User.id`)
- `section` → `Section.progress` (many-to-one, FK `sectionId` → `Section.id`)

**Note**: The `@@unique([userId, sectionId])` composite index makes `UserProgress` effectively a join table implementing a many-to-many relationship between `User` and `Section`.

---

## Enums

### Role

| Value | Description |
|-------|-------------|
| `ADMIN` | Full platform access |
| `INSTRUCTOR` | Can create/edit content and upload videos (along with `ADMIN`) |
| `STUDENT` | Read-only content access + progress tracking |

Used by `User.role`. Defaults to `STUDENT`.

### Difficulty

| Value | Description |
|-------|-------------|
| `BEGINNER` | |
| `INTERMEDIATE` | |
| `ADVANCED` | |

Used by `VideoMetadata.difficulty`.

### PrimaryStyle

| Value | Description |
|-------|-------------|
| `MAMBO_ON2` | Mambo On2 (NY style) |
| `CASINO` | Casino (Cuban salsa) |
| `SENSUAL_BACHATA` | Sensual bachata |

Used by `VideoMetadata.primaryStyle`.

### VideoType

| Value | Description |
|-------|-------------|
| `STEP_BREAKDOWN` | Individual step broken down |
| `COMBINATION` | Combination of steps |
| `FULL_PATTERN` | Full choreographed pattern |
| `SHINES_SEQUENCE` | Solo shines sequence |

Used by `VideoMetadata.videoType`.