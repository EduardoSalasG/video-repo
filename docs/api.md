# Dance Education Platform — API Documentation

**Base URL**: `http://localhost:<port>` (no `/api` prefix; routes are mounted directly, e.g. `/auth`, `/modules`, `/search`)

## Authentication

All endpoints except the two auth endpoints (`POST /auth/register`, `POST /auth/login`) and the magic-link request (`POST /auth/magic-link`) require a **JWT bearer token**.

| Header | Value |
|--------|-------|
| `Authorization` | `Bearer <accessToken>` |

**Middleware used**:

| Middleware | Effect |
|------------|--------|
| `authenticateUser` | Validates the JWT and attaches the current user to the request. Fails with `401` when the token is missing, invalid, expired, or the user no longer exists. |
| `requireInstructor` | Requires the authenticated user's role to be `INSTRUCTOR` or `ADMIN`. Fails with `403` otherwise. |

## Error Handling

Responses use the following status codes:

| Status | Meaning |
|--------|---------|
| `200` | Success |
| `201` | Resource created |
| `204` | Success, no body (delete) |
| `400` | Validation error (Zod). Body: `{ "error": <zod issues> }` |
| `401` | Missing/invalid/expired token, or bad credentials |
| `403` | Insufficient permissions (role restriction) |
| `404` | Resource not found |
| `409` | Conflict (e.g. duplicate email/username) |
| `500` | Internal server error |

All timestamps are ISO-8601 strings.

---

## Auth

### POST /auth/register

Create a new user account. Public (no auth required).

**Request body**:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `email` | string | yes | Must be a valid email |
| `username` | string | yes | Min 3 chars |
| `firstName` | string | yes | Min 1 char |
| `lastName` | string | yes | Min 1 char |
| `password` | string | yes | Min 6 chars |
| `role` | enum | no | `ADMIN` \| `INSTRUCTOR` \| `STUDENT`. Defaults to `STUDENT` |

**Example request**:

```http
POST /auth/register
Content-Type: application/json

{
  "email": "ana@example.com",
  "username": "ana_dancer",
  "firstName": "Ana",
  "lastName": "Lopez",
  "password": "secret123",
  "role": "STUDENT"
}
```

**Example response** (`201`):

```json
{
  "accessToken": "<jwt-token>",
  "user": {
    "id": "b3f1...",
    "email": "ana@example.com",
    "username": "ana_dancer",
    "firstName": "Ana",
    "lastName": "Lopez",
    "role": "STUDENT",
    "createdAt": "2026-08-15T10:00:00.000Z",
    "updatedAt": "2026-08-15T10:00:00.000Z"
  }
}
```

**Errors**: `400` validation, `409` user with the same email/username already exists.

---

### POST /auth/login

Log in with email and password. Public (no auth required).

**Request body**:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `email` | string | yes | Must be a valid email |
| `password` | string | yes | Min 1 char |

**Example request**:

```http
POST /auth/login
Content-Type: application/json

{
  "email": "ana@example.com",
  "password": "secret123"
}
```

**Example response** (`200`):

```json
{
  "accessToken": "<jwt-token>",
  "user": {
    "id": "b3f1...",
    "email": "ana@example.com",
    "username": "ana_dancer",
    "firstName": "Ana",
    "lastName": "Lopez",
    "role": "STUDENT",
    "createdAt": "2026-08-15T10:00:00.000Z",
    "updatedAt": "2026-08-15T10:00:00.000Z"
  }
}
```

The user object never includes `passwordHash`.

**Errors**: `400` validation, `401` invalid email or password (generic message to avoid user enumeration).

---

### GET /auth/me

Return the currently authenticated user (including role, which is not present in the JWT payload). Requires auth.

**Example request**:

```http
GET /auth/me
Authorization: Bearer <token>
```

**Example response** (`200`):

```json
{
  "user": {
    "id": "b3f1...",
    "email": "ana@example.com",
    "username": "ana_dancer",
    "firstName": "Ana",
    "lastName": "Lopez",
    "role": "STUDENT",
    "createdAt": "2026-08-15T10:00:00.000Z",
    "updatedAt": "2026-08-15T10:00:00.000Z"
  }
}
```

The user object never includes `passwordHash`.

**Errors**: `401` missing/invalid/expired token or user not found.

---

### POST /auth/magic-link

Request a passwordless magic link for an email address. Public (no auth required). If the user exists, a `Session` record is created (token expires after 1 hour); the same generic message is always returned to prevent email enumeration.

**Request body**:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `email` | string | yes | Must be a valid email |

**Example request**:

```http
POST /auth/magic-link
Content-Type: application/json

{
  "email": "ana@example.com"
}
```

**Example response** (`200`):

```json
{
  "message": "If the email exists, a magic link has been sent."
}
```

**Errors**: `400` validation.

---

## Modules

### GET /modules

List modules with pagination. Requires auth.

**Query params**:

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| `page` | number | `1` | Positive integer |
| `limit` | number | `10` | Positive integer, max `100` |
| `search` | string | — | Case-insensitive match on title/description |

**Example request**:

```http
GET /modules?page=1&limit=10&search=mambo
Authorization: Bearer <token>
```

**Example response** (`200`):

```json
{
  "modules": [
    {
      "id": "m1...",
      "title": "Mambo On2 Fundamentals",
      "description": "Foundational Mambo On2 technique",
      "orderIndex": 0,
      "sectionCount": 4,
      "createdAt": "2026-08-01T09:00:00.000Z",
      "updatedAt": "2026-08-01T09:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

**Errors**: `400` validation, `401` unauthorized.

---

### GET /modules/:id

Get a single module including its sections. Requires auth.

**Path params**: `id` (string, required).

**Example request**:

```http
GET /modules/m1...
Authorization: Bearer <token>
```

**Example response** (`200`):

```json
{
  "id": "m1...",
  "title": "Mambo On2 Fundamentals",
  "description": "Foundational Mambo On2 technique",
  "orderIndex": 0,
  "createdAt": "2026-08-01T09:00:00.000Z",
  "updatedAt": "2026-08-01T09:00:00.000Z",
  "sections": [
    {
      "id": "s1...",
      "title": "Basic Step",
      "description": "The on1 vs on2 difference",
      "orderIndex": 0,
      "videoUrl": null,
      "markdownContent": "# Basic Step...",
      "createdAt": "2026-08-01T10:00:00.000Z",
      "updatedAt": "2026-08-01T10:00:00.000Z"
    }
  ]
}
```

Sections are ordered by `orderIndex` ascending.

**Errors**: `400` validation, `401` unauthorized, `404` module not found.

---

### POST /modules

Create a new module. Requires auth + instructor/admin.

**Request body**:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `title` | string | yes | Min 1 char |
| `description` | string | no | |
| `orderIndex` | number | no | Non-negative integer. Defaults to `0` |

**Example request**:

```http
POST /modules
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Sensual Bachata Basics",
  "description": "Intro to Sensual Bachata",
  "orderIndex": 1
}
```

**Example response** (`201`):

```json
{
  "id": "m2...",
  "title": "Sensual Bachata Basics",
  "description": "Intro to Sensual Bachata",
  "orderIndex": 1,
  "createdAt": "2026-08-15T10:00:00.000Z",
  "updatedAt": "2026-08-15T10:00:00.000Z"
}
```

**Errors**: `400` validation, `401` unauthorized, `403` role not allowed.

---

### PATCH /modules/:id

Update an existing module. Requires auth + instructor/admin.

**Path params**: `id` (string, required).

**Request body** (all optional):

| Field | Type | Notes |
|-------|------|-------|
| `title` | string | Min 1 char |
| `description` | string \| null | `null` clears the value |
| `orderIndex` | number | Non-negative integer |

**Example request**:

```http
PATCH /modules/m1...
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Mambo On2 Fundamentals (Updated)",
  "orderIndex": 2
}
```

**Example response** (`200`):

```json
{
  "id": "m1...",
  "title": "Mambo On2 Fundamentals (Updated)",
  "description": "Foundational Mambo On2 technique",
  "orderIndex": 2,
  "createdAt": "2026-08-01T09:00:00.000Z",
  "updatedAt": "2026-08-15T10:00:00.000Z"
}
```

**Errors**: `400` validation, `401` unauthorized, `403` role not allowed, `404` module not found.

---

### DELETE /modules/:id

Delete a module. Requires auth + instructor/admin.

**Path params**: `id` (string, required).

**Example request**:

```http
DELETE /modules/m1...
Authorization: Bearer <token>
```

**Example response** (`204`): empty body.

**Errors**: `400` validation, `401` unauthorized, `403` role not allowed, `404` module not found.

---

## Sections

### GET /modules/:moduleId/sections

List sections belonging to a module, with pagination. Requires auth.

**Path params**: `moduleId` (string, required).

**Query params**:

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| `page` | number | `1` | Positive integer |
| `limit` | number | `10` | Positive integer, max `100` |
| `search` | string | — | Case-insensitive match on title/description |

**Example request**:

```http
GET /modules/m1.../sections?page=1&limit=10
Authorization: Bearer <token>
```

**Example response** (`200`):

```json
{
  "sections": [
    {
      "id": "s1...",
      "moduleId": "m1...",
      "title": "Basic Step",
      "description": "The on1 vs on2 difference",
      "orderIndex": 0,
      "videoUrl": null,
      "markdownContent": null,
      "createdAt": "2026-08-01T10:00:00.000Z",
      "updatedAt": "2026-08-01T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

**Errors**: `400` validation, `401` unauthorized.

---

### GET /modules/:moduleId/sections/:sectionId

Get a single section. Requires auth.

**Path params**: `moduleId`, `sectionId` (strings, required).

**Example request**:

```http
GET /modules/m1.../sections/s1...
Authorization: Bearer <token>
```

**Example response** (`200`):

```json
{
  "id": "s1...",
  "moduleId": "m1...",
  "title": "Basic Step",
  "description": "The on1 vs on2 difference",
  "orderIndex": 0,
  "videoUrl": null,
  "markdownContent": "# Basic Step\n...",
  "createdAt": "2026-08-01T10:00:00.000Z",
  "updatedAt": "2026-08-01T10:00:00.000Z"
}
```

**Errors**: `400` validation, `401` unauthorized, `404` section not found.

---

### POST /modules/:moduleId/sections

Create a section inside a module. Requires auth + instructor/admin.

**Path params**: `moduleId` (string, required).

**Request body**:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `title` | string | yes | Min 1 char |
| `description` | string | no | |
| `orderIndex` | number | no | Non-negative integer. Defaults to `0` |
| `videoUrl` | string | no | |
| `markdownContent` | string | no | Markdown body for the section |

**Example request**:

```http
POST /modules/m1.../sections
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Cross Body Lead",
  "description": "Leading the follower across",
  "orderIndex": 1,
  "markdownContent": "# Cross Body Lead\nStep 1..."
}
```

**Example response** (`201`):

```json
{
  "id": "s2...",
  "moduleId": "m1...",
  "title": "Cross Body Lead",
  "description": "Leading the follower across",
  "orderIndex": 1,
  "videoUrl": null,
  "markdownContent": "# Cross Body Lead\nStep 1...",
  "createdAt": "2026-08-15T10:00:00.000Z",
  "updatedAt": "2026-08-15T10:00:00.000Z"
}
```

**Errors**: `400` validation, `401` unauthorized, `403` role not allowed.

---

### PATCH /modules/:moduleId/sections/:sectionId

Update an existing section. Requires auth + instructor/admin.

**Path params**: `moduleId`, `sectionId` (strings, required).

**Request body** (all optional):

| Field | Type | Notes |
|-------|------|-------|
| `title` | string | Min 1 char |
| `description` | string \| null | `null` clears the value |
| `orderIndex` | number | Non-negative integer |
| `videoUrl` | string \| null | `null` clears the value |
| `markdownContent` | string \| null | `null` clears the value |

**Example request**:

```http
PATCH /modules/m1.../sections/s1...
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Basic Step (On2)",
  "videoUrl": "https://cdn.example.com/videos/basic-on2.mp4"
}
```

**Example response** (`200`):

```json
{
  "id": "s1...",
  "moduleId": "m1...",
  "title": "Basic Step (On2)",
  "description": "The on1 vs on2 difference",
  "orderIndex": 0,
  "videoUrl": "https://cdn.example.com/videos/basic-on2.mp4",
  "markdownContent": "# Basic Step\n...",
  "createdAt": "2026-08-01T10:00:00.000Z",
  "updatedAt": "2026-08-15T10:00:00.000Z"
}
```

**Errors**: `400` validation, `401` unauthorized, `403` role not allowed, `404` section not found.

---

### DELETE /modules/:moduleId/sections/:sectionId

Delete a section. Requires auth + instructor/admin.

**Path params**: `moduleId`, `sectionId` (strings, required).

**Example request**:

```http
DELETE /modules/m1.../sections/s1...
Authorization: Bearer <token>
```

**Example response** (`204`): empty body.

**Errors**: `400` validation, `401` unauthorized, `403` role not allowed, `404` section not found.

---

## Video Metadata

A section has at most one `VideoMetadata` record (`sectionId` is unique).

### GET /modules/:moduleId/sections/:sectionId/video-metadata

Get the video metadata for a section. Requires auth.

**Path params**: `moduleId`, `sectionId` (strings, required).

**Example request**:

```http
GET /modules/m1.../sections/s1.../video-metadata
Authorization: Bearer <token>
```

**Example response** (`200`):

```json
{
  "id": "v1...",
  "sectionId": "s1...",
  "steps": ["step1", "step2"],
  "difficulty": "BEGINNER",
  "primaryStyle": "MAMBO_ON2",
  "influences": ["tito"],
  "durationCounts": 4,
  "videoType": "STEP_BREAKDOWN",
  "tags": ["basic", "on2"],
  "fileSize": 15204352,
  "durationSeconds": 72,
  "filename": "a1b2c3.mp4",
  "createdAt": "2026-08-15T10:00:00.000Z",
  "updatedAt": "2026-08-15T10:00:00.000Z"
}
```

**Errors**: `400` validation, `401` unauthorized, `404` no metadata for this section.

---

### POST /modules/:moduleId/sections/:sectionId/video-metadata

Create video metadata for a section. Requires auth + instructor/admin.

**Path params**: `moduleId`, `sectionId` (strings, required).

**Request body**:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `sectionId` | string | yes | Must reference an existing section |
| `steps` | array | yes | At least one entry |
| `difficulty` | enum | yes | `BEGINNER` \| `INTERMEDIATE` \| `ADVANCED` |
| `primaryStyle` | enum | yes | `MAMBO_ON2` \| `CASINO` \| `SENSUAL_BACHATA` |
| `influences` | array | yes | |
| `durationCounts` | number | yes | Non-negative integer |
| `videoType` | enum | yes | `STEP_BREAKDOWN` \| `COMBINATION` \| `FULL_PATTERN` \| `SHINES_SEQUENCE` |
| `tags` | array | yes | |
| `fileSize` | number \| null | no | Non-negative integer |
| `durationSeconds` | number \| null | no | Non-negative integer |
| `filename` | string \| null | no | |

**Example request**:

```http
POST /modules/m1.../sections/s1.../video-metadata
Authorization: Bearer <token>
Content-Type: application/json

{
  "sectionId": "s1...",
  "steps": ["1", "2"],
  "difficulty": "BEGINNER",
  "primaryStyle": "MAMBO_ON2",
  "influences": [],
  "durationCounts": 2,
  "videoType": "STEP_BREAKDOWN",
  "tags": ["basic"]
}
```

**Example response** (`201`): the created `VideoMetadata` object (same shape as `GET` above).

**Errors**: `400` validation, `401` unauthorized, `403` role not allowed.

---

### PATCH /modules/:moduleId/sections/:sectionId/video-metadata

Update video metadata for a section. Requires auth + instructor/admin.

**Path params**: `moduleId`, `sectionId` (strings, required).

**Request body** (all optional, same types as create):

```json
{
  "difficulty": "INTERMEDIATE",
  "tags": ["basic", "on2"]
}
```

**Example response** (`200`): the updated `VideoMetadata` object.

**Errors**: `400` validation, `401` unauthorized, `403` role not allowed, `404` metadata not found.

---

### DELETE /modules/:moduleId/sections/:sectionId/video-metadata

Delete video metadata for a section. Requires auth + instructor/admin.

**Path params**: `moduleId`, `sectionId` (strings, required).

**Example request**:

```http
DELETE /modules/m1.../sections/s1.../video-metadata
Authorization: Bearer <token>
```

**Example response** (`204`): empty body.

**Errors**: `400` validation, `401` unauthorized, `403` role not allowed, `404` metadata not found.

---

### POST /modules/:moduleId/sections/:sectionId/upload-video

Upload a video file for a section. The server extracts duration and file size, then creates a `VideoMetadata` record with default values. Requires auth + instructor/admin.

**Path params**: `moduleId`, `sectionId` (strings, required).

**Content-Type**: `multipart/form-data`

**Form fields**:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `video` | file | yes | Accepted MIME types: `video/mp4`, `video/quicktime`, `video/x-msvideo`, `video/x-ms-wmv`. Max size 500 MB |

**Example request**:

```http
POST /modules/m1.../sections/s1.../upload-video
Authorization: Bearer <token>
Content-Type: multipart/form-data

video: <binary file>
```

**Example response** (`201`):

```json
{
  "message": "Video uploaded successfully",
  "videoMetadata": {
    "id": "v2...",
    "sectionId": "s1...",
    "steps": [],
    "difficulty": "BEGINNER",
    "primaryStyle": "MAMBO_ON2",
    "influences": [],
    "durationCounts": 0,
    "videoType": "STEP_BREAKDOWN",
    "tags": [],
    "fileSize": 15204352,
    "durationSeconds": 72,
    "filename": "a1b2c3d4.mp4",
    "createdAt": "2026-08-15T10:00:00.000Z",
    "updatedAt": "2026-08-15T10:00:00.000Z"
  }
}
```

**Errors**: `400` no file / invalid file type / size limit exceeded / validation, `401` unauthorized, `403` role not allowed.

---

## Content (Markdown)

### GET /modules/:moduleId/sections/:sectionId/content

Get the markdown content for a section. Requires auth.

**Path params**: `moduleId`, `sectionId` (strings, required).

**Example request**:

```http
GET /modules/m1.../sections/s1.../content
Authorization: Bearer <token>
```

**Example response** (`200`):

```json
{
  "markdownContent": "# Basic Step\nOn2 timing..."
}
```

**Errors**: `400` validation, `401` unauthorized, `404` section not found.

---

### PATCH /modules/:moduleId/sections/:sectionId/content

Update the markdown content for a section. Requires auth + instructor/admin.

**Path params**: `moduleId`, `sectionId` (strings, required).

**Request body**:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `markdownContent` | string \| null | no | `null` clears the content |

**Example request**:

```http
PATCH /modules/m1.../sections/s1.../content
Authorization: Bearer <token>
Content-Type: application/json

{
  "markdownContent": "# Basic Step\nUpdated on2 timing notes..."
}
```

**Example response** (`200`):

```json
{
  "markdownContent": "# Basic Step\nUpdated on2 timing notes..."
}
```

**Errors**: `400` validation, `401` unauthorized, `403` role not allowed, `404` section not found.

---

## Search

### GET /search

Search video metadata by keyword and structured filters. Requires auth.

**Query params**:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `search` | string | no | Case-insensitive match on the related section title/description and exact match on video `tags` |
| `primaryStyle` | enum | no | `MAMBO_ON2` \| `CASINO` \| `SENSUAL_BACHATA` |
| `difficulty` | enum | no | `BEGINNER` \| `INTERMEDIATE` \| `ADVANCED` |
| `videoType` | enum | no | `STEP_BREAKDOWN` \| `COMBINATION` \| `FULL_PATTERN` \| `SHINES_SEQUENCE` |
| `page` | number | no | Positive integer. Default `1` |
| `limit` | number | no | Positive integer, max `100`. Default `10` |

**Example request**:

```http
GET /search?search=basic&difficulty=BEGINNER&primaryStyle=MAMBO_ON2&page=1&limit=10
Authorization: Bearer <token>
```

**Example response** (`200`):

```json
{
  "videoMetadata": [
    {
      "id": "v1...",
      "sectionId": "s1...",
      "steps": ["step1", "step2"],
      "difficulty": "BEGINNER",
      "primaryStyle": "MAMBO_ON2",
      "influences": [],
      "durationCounts": 4,
      "videoType": "STEP_BREAKDOWN",
      "tags": ["basic", "on2"],
      "fileSize": 15204352,
      "durationSeconds": 72,
      "filename": "a1b2c3.mp4",
      "createdAt": "2026-08-15T10:00:00.000Z",
      "updatedAt": "2026-08-15T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

Results are ordered by `createdAt` descending. Filters are combined with AND.

**Errors**: `400` validation, `401` unauthorized.

---

## Progress

Progress is per-user. All progress endpoints use the authenticated user's ID — the user can only read/update their own progress.

### GET /sections/:sectionId/progress

Get the current user's progress for a section. Requires auth.

**Path params**: `sectionId` (string, required).

**Example request**:

```http
GET /sections/s1.../progress
Authorization: Bearer <token>
```

**Example response** (`200`):

```json
{
  "id": "p1...",
  "userId": "u1...",
  "sectionId": "s1...",
  "completedAt": null,
  "lastPositionSeconds": 45,
  "updatedAt": "2026-08-15T10:00:00.000Z"
}
```

**Errors**: `400` validation, `401` unauthorized, `404` no progress record for this section.

---

### PATCH /sections/:sectionId/progress

Upsert the current user's progress for a section (creates if missing, updates otherwise). Requires auth.

**Path params**: `sectionId` (string, required).

**Request body** (all optional):

| Field | Type | Notes |
|-------|------|-------|
| `completedAt` | date string \| null | ISO-8601. `null` clears the value |
| `lastPositionSeconds` | number \| null | Non-negative integer. `null` clears the value |

**Example request**:

```http
PATCH /sections/s1.../progress
Authorization: Bearer <token>
Content-Type: application/json

{
  "lastPositionSeconds": 120
}
```

**Example response** (`200`):

```json
{
  "id": "p1...",
  "userId": "u1...",
  "sectionId": "s1...",
  "completedAt": null,
  "lastPositionSeconds": 120,
  "updatedAt": "2026-08-15T10:00:00.000Z"
}
```

**Errors**: `400` validation, `401` unauthorized, `404` section not found.

---

### PATCH /sections/:sectionId/progress/complete

Mark the current user's section as complete (upsert). Requires auth.

**Path params**: `sectionId` (string, required).

**Request body** (all optional):

| Field | Type | Notes |
|-------|------|-------|
| `completedAt` | date string | ISO-8601. Defaults to the current time if omitted |

**Example request**:

```http
PATCH /sections/s1.../progress/complete
Authorization: Bearer <token>
Content-Type: application/json

{
  "completedAt": "2026-08-15T10:00:00.000Z"
}
```

**Example response** (`200`):

```json
{
  "id": "p1...",
  "userId": "u1...",
  "sectionId": "s1...",
  "completedAt": "2026-08-15T10:00:00.000Z",
  "lastPositionSeconds": null,
  "updatedAt": "2026-08-15T10:00:00.000Z"
}
```

**Errors**: `400` validation, `401` unauthorized, `404` section not found.

---

### GET /progress

Get a paginated list of the current user's progress. Requires auth.

**Query params**:

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| `page` | number | `1` | Positive integer |
| `limit` | number | `10` | Positive integer, max `100` |

**Example request**:

```http
GET /progress?page=1&limit=10
Authorization: Bearer <token>
```

**Example response** (`200`):

```json
{
  "progress": [
    {
      "id": "p1...",
      "userId": "u1...",
      "sectionId": "s1...",
      "completedAt": "2026-08-15T10:00:00.000Z",
      "lastPositionSeconds": 120,
      "updatedAt": "2026-08-15T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

Results are ordered by `updatedAt` descending.

**Errors**: `400` validation, `401` unauthorized.

---

## Known Issues & Notes

- `POST /auth/register` currently returns a hardcoded placeholder token (`"accessToken": "faketoken"`) instead of the generated JWT.
- `GET`, `PATCH`, and `DELETE` `/modules/:moduleId/sections/:sectionId/video-metadata` controllers parse `req.params` for an `id` field while the route exposes `sectionId`; until fixed, these endpoints fail with a `400` validation error. The intended contract is documented above.
- `POST /modules/:moduleId/sections/:sectionId/video-metadata` requires `sectionId` in the request body (in addition to the URL path parameter).
- `POST /auth/magic-link` creates a `Session` record but does not email the link; the token is not returned in the response.