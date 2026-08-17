# Dance Education Platform — Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Next.js frontend (student learning experience + instructor/admin content management) on top of the existing `@video-repo/backend` API, as the `frontend/` npm workspace.

**Architecture:** A single Next.js 15 App Router application with role-separated route groups. Server Components fetch data from the backend using the JWT from an httpOnly cookie; client components handle interactivity (video player, forms, uploads). JWT obtained via a Next.js route handler proxying `POST /auth/login`, stored in an httpOnly cookie.

**Tech Stack:** Next.js 15 · React 19 · TypeScript strict · Tailwind CSS · video.js · Zod · Vitest + React Testing Library. Design via impeccable + apple-design skills.

**Spec:** `docs/superpowers/specs/2026-08-16-dance-education-frontend-design.md`

## Global Constraints

- TypeScript strict mode enabled; single quotes, no semicolons (Prettier).
- Backend base URL from `NEXT_PUBLIC_API_URL`, default `http://localhost:3000` (backend's default port).
- JWT stored in an httpOnly, sameSite=lax cookie named `video_repo_token`.
- All backend calls must send `Authorization: Bearer <token>`.
- The only backend change required is `GET /auth/me` (Task 1). No other backend edits.
- Tests: Vitest + RTL for frontend; run via `npm test --workspace frontend`.
- Design: follow impeccable anti-patterns (no pure-black/gray, no nested-card soup, tinted backgrounds) and apple-design (translucent chrome via `backdrop-filter`, critically-damped springs, size-specific letter-spacing, `prefers-reduced-motion` support).
- Frontend dev server must run on a different port than backend (backend uses 3000; frontend uses 3001 via `-p 3001`).
- Do NOT commit `.env` (gitignored). Commit `.env.example`.

---

### Task 1: Backend — Add `GET /auth/me` endpoint

The frontend needs the authenticated user's role for authorization. The JWT payload only carries `userId` and no endpoint returns the current user.

**Files:**
- Modify: `backend/src/controllers/authController.ts` (add `getCurrentUser`)
- Modify: `backend/src/routes/authRoutes.ts:5-8`
- Test: `backend/tests/unit/authController.test.ts`, `backend/tests/integration/authRoutes.test.ts`

**Interfaces:**
- Consumes: `authenticateUser` middleware (already attaches `req.user` with `{ id, email, username, firstName, lastName, role, createdAt, updatedAt }`).
- Produces: `GET /auth/me` → `200 { user: { id, email, username, firstName, lastName, role, createdAt, updatedAt } }`. `401` if no/invalid token.

- [ ] **Step 1: Write the failing tests**

Add to `backend/tests/integration/authRoutes.test.ts`:

```ts
describe('GET /auth/me', () => {
  it('returns the authenticated user', async () => {
    const user = await createUser('STUDENT')
    const res = await request(app)
      .get('/auth/me')
      .set('Authorization', `Bearer ${generateToken({ userId: user.id }, process.env.JWT_SECRET!)}`)
    expect(res.status).toBe(200)
    expect(res.body.user).toMatchObject({
      id: user.id,
      email: user.email,
      role: 'STUDENT',
    })
  })

  it('rejects unauthenticated requests', async () => {
    const res = await request(app).get('/auth/me')
    expect(res.status).toBe(401)
  })
})
```

Add a matching unit test to `backend/tests/unit/authController.test.ts`:

```ts
it('getCurrentUser returns req.user', async () => {
  const mockUser = { id: 'u1', role: 'STUDENT' }
  const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as any
  await getCurrentUser({ user: mockUser } as any, res, vi.fn() as any)
  expect(res.json).toHaveBeenCalledWith({ user: mockUser })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cmd.exe /c "cd /d C:\Users\salas\Documents\video-repo\backend && npx vitest run tests/integration/authRoutes.test.ts tests/unit/authController.test.ts"`
Expected: FAIL — `getCurrentUser is not a function` / route returns 404.

- [ ] **Step 3: Implement the endpoint**

In `backend/src/controllers/authController.ts` add:

```ts
export async function getCurrentUser(req: Request, res: Response): Promise<void> {
  res.status(200).json({ user: (req as any).user })
}
```

In `backend/src/routes/authRoutes.ts` add before the `magicLink` route:

```ts
router.get('/me', authenticateUser, getCurrentUser);
```

Update the import in `authRoutes.ts` to include `getCurrentUser`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `cmd.exe /c "cd /d C:\Users\salas\Documents\video-repo\backend && npx vitest run tests/integration/authRoutes.test.ts tests/unit/authController.test.ts"`
Expected: PASS.

- [ ] **Step 5: Run full backend verify**

Run: `cmd.exe /c "cd /d C:\Users\salas\Documents\video-repo\backend && npm run verify"`
Expected: typecheck, lint, 344+ tests pass.

- [ ] **Step 6: Update docs**

Append a `### GET /auth/me` section to `backend/../docs/api.md` under Auth (mirroring the register/login response shape).

- [ ] **Step 7: Commit**

```bash
git add backend/src/controllers/authController.ts backend/src/routes/authRoutes.ts backend/tests docs/api.md
git commit -m "feat(auth): add GET /auth/me endpoint for current user"
```

---

### Task 2: Scaffold the frontend Next.js workspace

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/next.config.ts`
- Create: `frontend/tsconfig.json`
- Create: `frontend/tailwind.config.ts`
- Create: `frontend/postcss.config.mjs`
- Create: `frontend/eslint.config.mjs`
- Create: `frontend/vitest.config.ts`
- Create: `frontend/.env.example`
- Create: `frontend/.gitignore`
- Create: `frontend/app/layout.tsx`
- Create: `frontend/app/globals.css`
- Create: `frontend/app/page.tsx`
- Create: `frontend/src/config/site.ts`
- Test: `frontend/tests/smoke.test.ts`

**Interfaces:**
- Consumes: root npm workspaces (root `package.json` lists `frontend`).
- Produces: runnable `next dev`, `next build`, `npm test --workspace frontend`, `npm run typecheck --workspace frontend`.

- [ ] **Step 1: Create `frontend/package.json`**

```json
{
  "name": "@video-repo/frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3001",
    "build": "next build",
    "start": "next start -p 3001",
    "typecheck": "tsc --noEmit",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "next": "^15.1.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "zod": "^4.0.0",
    "video.js": "^8.17.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.0.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.6.0",
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@types/video.js": "^7.3.0",
    "eslint": "^9.0.0",
    "eslint-config-next": "^15.1.0",
    "jsdom": "^25.0.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.7.0",
    "vitest": "^4.1.0",
    "vite": "^6.0.0"
  }
}
```

- [ ] **Step 2: Create config files**

`frontend/next.config.ts`:
```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: { unoptimized: true },
}

export default nextConfig
```

`frontend/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

`frontend/tailwind.config.ts`:
```ts
import type { Config } from 'tailwindcss'

export default {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: 'var(--surface)',
        'surface-raised': 'var(--surface-raised)',
        ink: 'var(--ink)',
        accent: 'var(--accent)',
      },
    },
  },
  plugins: [],
} satisfies Config
```

`frontend/postcss.config.mjs`:
```js
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
```

`frontend/eslint.config.mjs`:
```js
import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores(['.next/**', 'out/**', 'build/**']),
])
```

`frontend/vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
    include: ['tests/**/*.test.{ts,tsx}'],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
})
```

Note: add `@vitejs/plugin-react` to `frontend/package.json` devDependencies.

- [ ] **Step 3: Create env + gitignore + site config**

`frontend/.env.example`:
```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

`frontend/.gitignore`:
```
node_modules/
.next/
out/
coverage/
.env
.env.local
```

`frontend/src/config/site.ts`:
```ts
export const siteConfig = {
  name: 'Dance Education Platform',
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000',
}
```

- [ ] **Step 4: Create root layout, globals.css, landing page**

`frontend/app/layout.tsx`:
```tsx
import type { Metadata } from 'next'
import './globals.css'
import { siteConfig } from '@/config/site'

export const metadata: Metadata = {
  title: { default: siteConfig.name, template: `%s · ${siteConfig.name}` },
  description: 'Learn Mambo On2, Casino, and Sensual Bachata through structured video lessons.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-surface text-ink antialiased">{children}</body>
    </html>
  )
}
```

`frontend/app/globals.css`:
```css
@import "tailwindcss";

:root {
  --surface: #f5f4f2;
  --surface-raised: #ffffff;
  --ink: #1c1b1a;
  --accent: #b3382c;
}

@media (prefers-color-scheme: dark) {
  :root {
    --surface: #141312;
    --surface-raised: #1f1e1c;
    --ink: #f2f0ed;
    --accent: #e06a5b;
  }
}
```

`frontend/app/page.tsx` — a simple landing page with a hero, links to `/login` and `/register`, and a CTA to `/library`. Use Tailwind classes; avoid nested cards; use tinted surfaces.

- [ ] **Step 5: Create the smoke test + setup**

`frontend/tests/setup.ts`:
```ts
import '@testing-library/jest-dom/vitest'
```

`frontend/tests/smoke.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { siteConfig } from '@/config/site'

describe('site config', () => {
  it('has an api url', () => {
    expect(siteConfig.apiUrl).toContain('http')
  })
})
```

- [ ] **Step 6: Install workspace deps**

Run: `cd /mnt/c/Users/salas/Documents/video-repo && npm install`
Expected: frontend workspace links into root `node_modules`.

- [ ] **Step 7: Run typecheck, tests, and dev server check**

Run: `npm run typecheck --workspace frontend && npm test --workspace frontend`
Expected: typecheck clean, smoke test passes. Then `npm run dev --workspace frontend` briefly and confirm it serves on :3001.

- [ ] **Step 8: Commit**

```bash
git add frontend
git commit -m "feat(frontend): scaffold Next.js app in frontend workspace"
```

---

### Task 3: Types + API client

**Files:**
- Create: `frontend/src/types/index.ts`
- Create: `frontend/src/lib/api.ts`
- Create: `frontend/src/lib/http.ts`
- Test: `frontend/tests/lib/api.test.ts`

**Interfaces:**
- Consumes: `siteConfig.apiUrl`.
- Produces:
  - `type Role = 'ADMIN' | 'INSTRUCTOR' | 'STUDENT'`
  - `type User`, `type Module`, `type Section`, `type VideoMetadata`, `type ProgressRecord`, `type Pagination`
  - `apiFetch<T>(path, opts)` and named API functions `fetchModules`, `fetchModule`, `fetchSections`, `fetchSection`, `fetchContent`, `fetchVideoMetadata`, `searchVideos`, `fetchProgress`, `fetchAllProgress`, `fetchMe`, `login`, `register`, `createModule`, `updateModule`, `deleteModule`, `createSection`, `updateSection`, `deleteSection`, `updateContent`, `createVideoMetadata`, `updateVideoMetadata`, `deleteVideoMetadata`, `uploadVideo`, `updateProgress`, `completeProgress`.

- [ ] **Step 1: Write the failing tests**

`frontend/tests/lib/api.test.ts`:
```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiFetch, fetchModules } from '@/lib/api'

const mockFetch = vi.fn()

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch)
  mockFetch.mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({ modules: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } }),
  })
})

describe('apiFetch', () => {
  it('adds Authorization header from token param', async () => {
    await apiFetch('/modules', { token: 'abc', method: 'GET' })
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/modules'),
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer abc' }) })
    )
  })

  it('throws on non-ok response', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({ error: 'nope' }) })
    await expect(apiFetch('/modules', { token: 'abc' })).rejects.toThrow(/401|nope/)
  })
})

describe('fetchModules', () => {
  it('returns modules', async () => {
    const res = await fetchModules('tok', { page: 1, limit: 10 })
    expect(res.modules).toEqual([])
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test --workspace frontend`
Expected: FAIL — `@/lib/api` not found.

- [ ] **Step 3: Implement types, http, api**

`frontend/src/types/index.ts`:
```ts
export type Role = 'ADMIN' | 'INSTRUCTOR' | 'STUDENT'
export type Difficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
export type PrimaryStyle = 'MAMBO_ON2' | 'CASINO' | 'SENSUAL_BACHATA'
export type VideoType = 'STEP_BREAKDOWN' | 'COMBINATION' | 'FULL_PATTERN' | 'SHINES_SEQUENCE'

export interface User {
  id: string
  email: string
  username: string
  firstName: string
  lastName: string
  role: Role
  createdAt: string
  updatedAt: string
}

export interface Module {
  id: string
  title: string
  description: string | null
  orderIndex: number
  createdAt: string
  updatedAt: string
  sectionCount?: number
  sections?: Section[]
}

export interface Section {
  id: string
  moduleId: string
  title: string
  description: string | null
  orderIndex: number
  videoUrl: string | null
  markdownContent: string | null
  createdAt: string
  updatedAt: string
}

export interface VideoMetadata {
  id: string
  sectionId: string
  steps: string[]
  difficulty: Difficulty
  primaryStyle: PrimaryStyle
  influences: string[]
  durationCounts: number
  videoType: VideoType
  tags: string[]
  fileSize: number | null
  durationSeconds: number | null
  filename: string | null
  createdAt: string
  updatedAt: string
}

export interface ProgressRecord {
  id: string
  userId: string
  sectionId: string
  completedAt: string | null
  lastPositionSeconds: number | null
  updatedAt: string
}

export interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}
```

`frontend/src/lib/http.ts`:
```ts
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: unknown
  ) {
    super(message)
  }
}

export async function http<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(path, init)
  if (!res.ok) {
    let message = `Request failed (${res.status})`
    let body: unknown
    try {
      body = await res.json()
      if (typeof body === 'object' && body && 'error' in body) {
        message = String((body as { error: unknown }).error)
      }
    } catch {
      /* no body */
    }
    throw new ApiError(res.status, message, body)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}
```

`frontend/src/lib/api.ts`:
```ts
import { siteConfig } from '@/config/site'
import { http } from './http'
import type { Module, Pagination, ProgressRecord, Section, User, VideoMetadata } from '@/types'

function buildUrl(path: string, query?: Record<string, string | number | undefined>): string {
  const url = new URL(path, siteConfig.apiUrl)
  for (const [k, v] of Object.entries(query ?? {})) {
    if (v !== undefined && v !== '') url.searchParams.set(k, String(v))
  }
  return url.toString()
}

function auth(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` }
}

export async function apiFetch<T>(path: string, opts: { token: string; method?: string; query?: Record<string, string | number | undefined>; body?: unknown } = { token: '' }): Promise<T> {
  const headers: Record<string, string> = { ...auth(opts.token) }
  let body: BodyInit | undefined
  if (opts.body !== undefined) {
    headers['Content-Type'] = 'application/json'
    body = JSON.stringify(opts.body)
  }
  return http<T>(buildUrl(path, opts.query), { method: opts.method ?? 'GET', headers, body })
}

export interface ListResult<T> { items: T[]; pagination: Pagination }

// Auth
export function login(email: string, password: string) {
  return apiFetch<{ accessToken: string; user: User }>('/auth/login', {
    token: '', method: 'POST', body: { email, password },
  })
}
export function register(payload: { email: string; username: string; firstName: string; lastName: string; password: string; role?: string }) {
  return apiFetch<{ accessToken: string; user: User }>('/auth/register', {
    token: '', method: 'POST', body: payload,
  })
}
export function fetchMe(token: string) {
  return apiFetch<{ user: User }>('/auth/me', { token })
}

// Modules
export function fetchModules(token: string, query?: { page?: number; limit?: number; search?: string }) {
  return apiFetch<{ modules: Module[]; pagination: Pagination }>('/modules', { token, query })
}
export function fetchModule(token: string, id: string) {
  return apiFetch<Module>(`/modules/${id}`, { token })
}
export function createModule(token: string, body: { title: string; description?: string; orderIndex?: number }) {
  return apiFetch<Module>('/modules', { token, method: 'POST', body })
}
export function updateModule(token: string, id: string, body: { title?: string; description?: string | null; orderIndex?: number }) {
  return apiFetch<Module>(`/modules/${id}`, { token, method: 'PATCH', body })
}
export function deleteModule(token: string, id: string) {
  return apiFetch<void>(`/modules/${id}`, { token, method: 'DELETE' })
}

// Sections
export function fetchSections(token: string, moduleId: string, query?: { page?: number; limit?: number; search?: string }) {
  return apiFetch<{ sections: Section[]; pagination: Pagination }>(`/modules/${moduleId}/sections`, { token, query })
}
export function fetchSection(token: string, moduleId: string, sectionId: string) {
  return apiFetch<Section>(`/modules/${moduleId}/sections/${sectionId}`, { token })
}
export function createSection(token: string, moduleId: string, body: { title: string; description?: string; orderIndex?: number; videoUrl?: string; markdownContent?: string }) {
  return apiFetch<Section>(`/modules/${moduleId}/sections`, { token, method: 'POST', body })
}
export function updateSection(token: string, moduleId: string, sectionId: string, body: { title?: string; description?: string | null; orderIndex?: number; videoUrl?: string | null; markdownContent?: string | null }) {
  return apiFetch<Section>(`/modules/${moduleId}/sections/${sectionId}`, { token, method: 'PATCH', body })
}
export function deleteSection(token: string, moduleId: string, sectionId: string) {
  return apiFetch<void>(`/modules/${moduleId}/sections/${sectionId}`, { token, method: 'DELETE' })
}

// Content
export function fetchContent(token: string, moduleId: string, sectionId: string) {
  return apiFetch<{ markdownContent: string }>(`/modules/${moduleId}/sections/${sectionId}/content`, { token })
}
export function updateContent(token: string, moduleId: string, sectionId: string, markdownContent: string | null) {
  return apiFetch<{ markdownContent: string }>(`/modules/${moduleId}/sections/${sectionId}/content`, { token, method: 'PATCH', body: { markdownContent } })
}

// Video metadata
export function fetchVideoMetadata(token: string, moduleId: string, sectionId: string) {
  return apiFetch<VideoMetadata>(`/modules/${moduleId}/sections/${sectionId}/video-metadata`, { token })
}
export function createVideoMetadata(token: string, moduleId: string, sectionId: string, body: Omit<VideoMetadata, 'id' | 'createdAt' | 'updatedAt' | 'fileSize' | 'durationSeconds' | 'filename'> & { fileSize?: number | null; durationSeconds?: number | null; filename?: string | null }) {
  return apiFetch<VideoMetadata>(`/modules/${moduleId}/sections/${sectionId}/video-metadata`, { token, method: 'POST', body: { ...body, sectionId } })
}
export function updateVideoMetadata(token: string, moduleId: string, sectionId: string, body: Partial<Omit<VideoMetadata, 'id' | 'sectionId' | 'createdAt' | 'updatedAt'>>) {
  return apiFetch<VideoMetadata>(`/modules/${moduleId}/sections/${sectionId}/video-metadata`, { token, method: 'PATCH', body })
}
export function deleteVideoMetadata(token: string, moduleId: string, sectionId: string) {
  return apiFetch<void>(`/modules/${moduleId}/sections/${sectionId}/video-metadata`, { token, method: 'DELETE' })
}
export function uploadVideo(token: string, moduleId: string, sectionId: string, file: File) {
  const form = new FormData()
  form.append('video', file)
  return http<{ message: string; videoMetadata: VideoMetadata }>(`${siteConfig.apiUrl}/modules/${moduleId}/sections/${sectionId}/upload-video`, {
    method: 'POST',
    headers: auth(token),
    body: form,
  })
}

// Search
export function searchVideos(token: string, query: { search?: string; primaryStyle?: string; difficulty?: string; videoType?: string; page?: number; limit?: number }) {
  return apiFetch<{ videoMetadata: VideoMetadata[]; pagination: Pagination }>('/search', { token, query })
}

// Progress
export function fetchProgress(token: string, sectionId: string) {
  return apiFetch<ProgressRecord>(`/sections/${sectionId}/progress`, { token })
}
export function updateProgress(token: string, sectionId: string, body: { completedAt?: string | null; lastPositionSeconds?: number | null }) {
  return apiFetch<ProgressRecord>(`/sections/${sectionId}/progress`, { token, method: 'PATCH', body })
}
export function completeProgress(token: string, sectionId: string) {
  return apiFetch<ProgressRecord>(`/sections/${sectionId}/progress/complete`, { token, method: 'PATCH', body: {} })
}
export function fetchAllProgress(token: string, query?: { page?: number; limit?: number }) {
  return apiFetch<{ progress: ProgressRecord[]; pagination: Pagination }>('/progress', { token, query })
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test --workspace frontend`
Expected: PASS.

- [ ] **Step 5: Typecheck**

Run: `npm run typecheck --workspace frontend`
Expected: clean.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/types frontend/src/lib frontend/tests
git commit -m "feat(frontend): add types and typed API client"
```

---

### Task 4: Auth session — cookie, route handlers, middleware

**Files:**
- Create: `frontend/src/lib/session.ts`
- Create: `frontend/app/api/auth/login/route.ts`
- Create: `frontend/app/api/auth/logout/route.ts`
- Create: `frontend/app/api/auth/register/route.ts`
- Create: `frontend/middleware.ts`
- Test: `frontend/tests/lib/session.test.ts`

**Interfaces:**
- Consumes: `login`, `register` from `@/lib/api`.
- Produces:
  - `SESSION_COOKIE = 'video_repo_token'`
  - `setSessionCookie(token: string)`, `getSessionToken()`, `clearSessionCookie()` (server-only helpers)
  - `POST /api/auth/login` → 200 `{ user }`, sets cookie
  - `POST /api/auth/register` → 201 `{ user }`, sets cookie
  - `POST /api/auth/logout` → clears cookie
  - `middleware.ts` redirects to `/login` when session cookie missing on protected route groups.

- [ ] **Step 1: Write the failing test**

`frontend/tests/lib/session.test.ts`:
```ts
import { describe, it, expect, vi, afterEach } from 'vitest'

// Run in jsdom-like environment: validate pure helpers that don't touch Next's cookies()
vi.mock('next/headers', () => ({ cookies: vi.fn() }))

import { SESSION_COOKIE } from '@/lib/session'

describe('session', () => {
  afterEach(() => vi.clearAllMocks())

  it('exposes the cookie name', () => {
    expect(SESSION_COOKIE).toBe('video_repo_token')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test --workspace frontend`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement session helpers**

`frontend/src/lib/session.ts` (server-only):
```ts
import { cookies } from 'next/headers'

export const SESSION_COOKIE = 'video_repo_token'

export async function getSessionToken(): Promise<string | undefined> {
  const store = await cookies()
  return store.get(SESSION_COOKIE)?.value
}

export async function setSessionCookie(token: string): Promise<void> {
  const store = await cookies()
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60,
  })
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies()
  store.delete(SESSION_COOKIE)
}
```

- [ ] **Step 4: Implement route handlers**

`frontend/app/api/auth/login/route.ts`:
```ts
import { NextResponse } from 'next/server'
import { login } from '@/lib/api'
import { setSessionCookie } from '@/lib/session'

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  if (!body?.email || !body?.password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
  }
  try {
    const { accessToken, user } = await login(String(body.email), String(body.password))
    await setSessionCookie(accessToken)
    return NextResponse.json({ user }, { status: 200 })
  } catch (err) {
    const status = err instanceof Error && /401/.test(err.message) ? 401 : 500
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Login failed' }, { status })
  }
}
```

`frontend/app/api/auth/register/route.ts`: mirror login, but call `register(...)` and return 201.

`frontend/app/api/auth/logout/route.ts`:
```ts
import { NextResponse } from 'next/server'
import { clearSessionCookie } from '@/lib/session'

export async function POST() {
  await clearSessionCookie()
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 5: Implement middleware**

`frontend/middleware.ts`:
```ts
import { NextRequest, NextResponse } from 'next/server'

const SESSION_COOKIE = 'video_repo_token'

const protectedPrefixes = ['/library', '/search', '/progress', '/admin']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get(SESSION_COOKIE)?.value

  if (protectedPrefixes.some((p) => pathname.startsWith(p)) && !token) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('from', pathname)
    return NextResponse.redirect(url)
  }

  if ((pathname === '/login' || pathname === '/register') && token) {
    const url = req.nextUrl.clone()
    url.pathname = '/library'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/library/:path*', '/search/:path*', '/progress/:path*', '/admin/:path*', '/login', '/register'],
}
```

Note: middleware gates by token presence. Role checks happen in layouts/pages via `fetchMe` (Task 5+). That is acceptable for v1 and avoids edge-runtime backend calls.

- [ ] **Step 6: Run tests + typecheck**

Run: `npm test --workspace frontend && npm run typecheck --workspace frontend`
Expected: PASS + clean.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/lib/session.ts frontend/app/api/auth frontend/middleware.ts frontend/tests
git commit -m "feat(frontend): add JWT cookie session and auth route handlers"
```

---

### Task 5: Auth pages — login + register

**Files:**
- Create: `frontend/app/(auth)/layout.tsx`
- Create: `frontend/app/(auth)/login/page.tsx`
- Create: `frontend/app/(auth)/register/page.tsx`
- Create: `frontend/src/components/ui/Button.tsx`
- Create: `frontend/src/components/ui/Input.tsx`
- Test: `frontend/tests/components/auth-pages.test.tsx`

**Interfaces:**
- Consumes: `SESSION_COOKIE` presence is handled by middleware; pages call `/api/auth/login` and `/api/auth/register`.
- Produces: client-side `LoginForm` and `RegisterForm` used by the pages; `Button`, `Input` shared UI primitives.

- [ ] **Step 1: Write the failing tests**

`frontend/tests/components/auth-pages.test.tsx`:
```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LoginForm from '@/components/auth/LoginForm'

vi.stubGlobal('fetch', vi.fn(() =>
  Promise.resolve({ ok: true, json: () => Promise.resolve({ user: { id: 'u1', role: 'STUDENT' } }) })
))

describe('LoginForm', () => {
  it('renders email and password fields', () => {
    render(<LoginForm />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it('submits credentials and redirects', async () => {
    const push = vi.fn()
    const { container } = render(<LoginForm />)
    const form = container.querySelector('form')!
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'a@b.com' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'secret' } })
    fireEvent.submit(form)
    await waitFor(() => expect(fetch).toHaveBeenCalledWith('/api/auth/login', expect.anything()))
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test --workspace frontend`
Expected: FAIL — component missing.

- [ ] **Step 3: Implement UI primitives**

`frontend/src/components/ui/Button.tsx`:
```tsx
import { forwardRef } from 'react'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' }

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = 'primary', className = '', ...props },
  ref
) {
  const base =
    variant === 'primary'
      ? 'bg-accent text-white hover:opacity-90'
      : 'bg-transparent text-ink hover:bg-surface-raised/60'
  return <button ref={ref} className={`rounded-lg px-4 py-2 font-medium transition ${base} ${className}`} {...props} />
})
```

`frontend/src/components/ui/Input.tsx`:
```tsx
import { forwardRef } from 'react'

type Props = React.InputHTMLAttributes<HTMLInputElement> & { label: string }

export const Input = forwardRef<HTMLInputElement, Props>(function Input({ label, id, ...props }, ref) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm">{label}</span>
      <input
        ref={ref}
        id={id}
        className="w-full rounded-lg border border-ink/15 bg-surface-raised px-3 py-2 outline-none focus:border-accent"
        {...props}
      />
    </label>
  )
})
```

- [ ] **Step 4: Implement auth forms**

`frontend/src/components/auth/LoginForm.tsx`:
```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function LoginForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const form = new FormData(e.currentTarget)
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: form.get('email'), password: form.get('password') }),
    })
    const data = await res.json().catch(() => null)
    setLoading(false)
    if (!res.ok) {
      setError(data?.error ?? 'Login failed')
      return
    }
    router.push('/library')
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto w-full max-w-sm space-y-4">
      <Input label="Email" name="email" type="email" required autoComplete="email" />
      <Input label="Password" name="password" type="password" required autoComplete="current-password" />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  )
}
```

`frontend/src/components/auth/RegisterForm.tsx`: mirror with fields email/username/firstName/lastName/password, POST `/api/auth/register`, then `router.push('/library')`.

- [ ] **Step 5: Implement pages + layout**

`frontend/app/(auth)/layout.tsx`:
```tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface p-4">
      <div className="w-full max-w-sm">{children}</div>
    </main>
  )
}
```

`frontend/app/(auth)/login/page.tsx`:
```tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import LoginForm from '@/components/auth/LoginForm'

export const metadata: Metadata = { title: 'Sign in' }

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
      <LoginForm />
      <p className="text-sm">
        No account? <Link href="/register" className="text-accent">Create one</Link>
      </p>
    </div>
  )
}
```

`frontend/app/(auth)/register/page.tsx`: mirror with `RegisterForm` and a link to `/login`.

- [ ] **Step 6: Run tests + typecheck**

Run: `npm test --workspace frontend && npm run typecheck --workspace frontend`
Expected: PASS + clean.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/components/auth frontend/src/components/ui frontend/app/'(auth)'
git commit -m "feat(frontend): add login and register pages"
```

---

### Task 6: Current-user resolution + role-gated layouts

**Files:**
- Create: `frontend/src/lib/user.ts`
- Create: `frontend/src/components/auth/UserNav.tsx`
- Create: `frontend/src/components/auth/LogoutButton.tsx`
- Create: `frontend/app/(student)/layout.tsx`
- Create: `frontend/app/(student)/library/page.tsx` (placeholder grid)
- Test: `frontend/tests/lib/user.test.ts`

**Interfaces:**
- Consumes: `getSessionToken`, `fetchMe` (Tasks 3–4).
- Produces:
  - `getCurrentUser()` — server-side helper returning `User | null`
  - `requireUser(roles?: Role[])` — throws redirect to `/login` if null, to `/library` if role not allowed
  - `UserNav` (server component) — shows name + role + LogoutButton

- [ ] **Step 1: Write the failing test**

`frontend/tests/lib/user.test.ts`:
```ts
import { describe, it, expect, vi } from 'vitest'

const fetchMe = vi.fn()
vi.mock('@/lib/api', () => ({ fetchMe: (...a: unknown[]) => fetchMe(...a) }))
vi.mock('next/headers', () => ({ cookies: vi.fn() }))

import { hasRole } from '@/lib/user'

describe('user helpers', () => {
  it('hasRole grants instructor access to instructor', () => {
    expect(hasRole('INSTRUCTOR', ['INSTRUCTOR', 'ADMIN'])).toBe(true)
  })
  it('hasRole denies student access to instructor area', () => {
    expect(hasRole('STUDENT', ['INSTRUCTOR', 'ADMIN'])).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test --workspace frontend`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement user helper**

`frontend/src/lib/user.ts` (server-only):
```ts
import { redirect } from 'next/navigation'
import { fetchMe } from './api'
import { getSessionToken } from './session'
import type { Role, User } from '@/types'

export function hasRole(role: Role, allowed: Role[]): boolean {
  return allowed.includes(role)
}

export async function getCurrentUser(): Promise<User | null> {
  const token = await getSessionToken()
  if (!token) return null
  try {
    const { user } = await fetchMe(token)
    return user
  } catch {
    return null
  }
}

export async function requireUser(allowed: Role[] = ['STUDENT', 'INSTRUCTOR', 'ADMIN']): Promise<{ user: User; token: string }> {
  const token = await getSessionToken()
  if (!token) redirect('/login')
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (!hasRole(user.role, allowed)) redirect('/library')
  return { user, token }
}
```

- [ ] **Step 4: Implement nav components**

`frontend/src/components/auth/LogoutButton.tsx`:
```tsx
'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'

export default function LogoutButton() {
  const router = useRouter()
  async function onLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
    router.refresh()
  }
  return (
    <Button variant="ghost" onClick={onLogout}>
      Sign out
    </Button>
  )
}
```

`frontend/src/components/auth/UserNav.tsx`:
```tsx
import Link from 'next/link'
import LogoutButton from './LogoutButton'
import type { User } from '@/types'

export default function UserNav({ user }: { user: User }) {
  return (
    <div className="flex items-center gap-4 text-sm">
      <span>{user.firstName} {user.lastName}</span>
      {user.role !== 'STUDENT' && (
        <Link href="/admin" className="text-accent">Admin</Link>
      )}
      <LogoutButton />
    </div>
  )
}
```

- [ ] **Step 5: Implement the student layout with translucent chrome**

`frontend/app/(student)/layout.tsx`:
```tsx
import Link from 'next/link'
import { requireUser } from '@/lib/user'
import UserNav from '@/components/auth/UserNav'

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireUser(['STUDENT', 'INSTRUCTOR', 'ADMIN'])

  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-10 border-b border-ink/10 bg-surface/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/library" className="font-semibold">Dance Academy</Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/library">Library</Link>
            <Link href="/search">Search</Link>
            <Link href="/progress">Progress</Link>
          </nav>
          <UserNav user={user} />
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  )
}
```

`frontend/app/(student)/library/page.tsx` — placeholder:
```tsx
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Library' }

export default function LibraryPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">Library</h1>
      <p>Modules will appear here.</p>
      <Link href="/admin" className="text-accent">Go to admin</Link>
    </div>
  )
}
```

- [ ] **Step 6: Run tests + typecheck**

Run: `npm test --workspace frontend && npm run typecheck --workspace frontend`
Expected: PASS + clean.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/lib/user.ts frontend/src/components/auth frontend/app/'(student)'
git commit -m "feat(frontend): add current-user resolution and student layout"
```

---

### Task 7: Library — module grid + module detail + section list

**Files:**
- Create: `frontend/src/components/library/ModuleCard.tsx`
- Create: `frontend/src/components/library/ModuleGrid.tsx`
- Create: `frontend/src/components/library/SectionItem.tsx`
- Create: `frontend/app/(student)/library/page.tsx`
- Create: `frontend/app/(student)/library/[moduleId]/page.tsx`
- Test: `frontend/tests/components/library.test.tsx`

**Interfaces:**
- Consumes: `requireUser`, `fetchModules`, `fetchModule` (Task 3, 6).
- Produces: module grid with pagination, module detail page with ordered section list.

- [ ] **Step 1: Write the failing test**

`frontend/tests/components/library.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ModuleCard from '@/components/library/ModuleCard'
import SectionItem from '@/components/library/SectionItem'

describe('ModuleCard', () => {
  it('renders title and section count', () => {
    render(<ModuleCard title="Mambo On2" sectionCount={4} href="/library/m1" />)
    expect(screen.getByText('Mambo On2')).toBeInTheDocument()
    expect(screen.getByText(/4 sections/)).toBeInTheDocument()
  })
})

describe('SectionItem', () => {
  it('renders a section title', () => {
    render(<SectionItem title="Basic Step" href="/library/m1/s1" completed={false} />)
    expect(screen.getByText('Basic Step')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test --workspace frontend`
Expected: FAIL — components missing.

- [ ] **Step 3: Implement library components**

`frontend/src/components/library/ModuleCard.tsx`:
```tsx
import Link from 'next/link'

export default function ModuleCard({ title, sectionCount, href }: { title: string; sectionCount: number; href: string }) {
  return (
    <Link href={href} className="block rounded-2xl bg-surface-raised p-5 shadow-sm transition hover:shadow-md">
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      <p className="mt-1 text-sm">{sectionCount} sections</p>
    </Link>
  )
}
```

`frontend/src/components/library/ModuleGrid.tsx`:
```tsx
import ModuleCard from './ModuleCard'
import type { Module } from '@/types'

export default function ModuleGrid({ modules }: { modules: Module[] }) {
  if (modules.length === 0) {
    return <p className="text-sm">No modules yet.</p>
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {modules.map((m) => (
        <ModuleCard key={m.id} title={m.title} sectionCount={m.sectionCount ?? 0} href={`/library/${m.id}`} />
      ))}
    </div>
  )
}
```

`frontend/src/components/library/SectionItem.tsx`:
```tsx
import Link from 'next/link'

export default function SectionItem({ title, href, completed }: { title: string; href: string; completed: boolean }) {
  return (
    <Link href={href} className="flex items-center justify-between rounded-xl bg-surface-raised px-4 py-3 transition hover:bg-surface-raised/70">
      <span>{title}</span>
      {completed && <span className="text-sm text-green-600">✓ Completed</span>}
    </Link>
  )
}
```

- [ ] **Step 4: Implement pages (server components)**

`frontend/app/(student)/library/page.tsx`:
```tsx
import type { Metadata } from 'next'
import { requireUser } from '@/lib/user'
import { fetchModules } from '@/lib/api'
import ModuleGrid from '@/components/library/ModuleGrid'

export const metadata: Metadata = { title: 'Library' }

export default async function LibraryPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { token } = await requireUser(['STUDENT', 'INSTRUCTOR', 'ADMIN'])
  const page = Number((await searchParams).page ?? '1')
  const data = await fetchModules(token, { page, limit: 12 })

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">Library</h1>
      <ModuleGrid modules={data.modules} />
    </div>
  )
}
```

`frontend/app/(student)/library/[moduleId]/page.tsx`:
```tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireUser } from '@/lib/user'
import { fetchModule } from '@/lib/api'
import SectionItem from '@/components/library/SectionItem'

export const metadata: Metadata = { title: 'Module' }

export default async function ModulePage({ params }: { params: Promise<{ moduleId: string }> }) {
  const { token } = await requireUser(['STUDENT', 'INSTRUCTOR', 'ADMIN'])
  const { moduleId } = await params
  let module
  try {
    module = await fetchModule(token, moduleId)
  } catch {
    notFound()
  }

  return (
    <div className="space-y-6">
      <Link href="/library" className="text-sm text-accent">← Library</Link>
      <h1 className="text-3xl font-semibold tracking-tight">{module.title}</h1>
      {module.description && <p>{module.description}</p>}
      <div className="space-y-2">
        {(module.sections ?? []).map((s) => (
          <SectionItem key={s.id} title={s.title} href={`/library/${module.id}/${s.id}`} completed={false} />
        ))}
      </div>
    </div>
  )
}
```

Note: if `GET /modules/:id` returns sections without completion state, that's acceptable for v1 — completion shown on the section page (Task 8). If the backend `fetchModule` shape differs (sections present), adjust the mapping accordingly.

- [ ] **Step 5: Run tests + typecheck**

Run: `npm test --workspace frontend && npm run typecheck --workspace frontend`
Expected: PASS + clean.

- [ ] **Step 6: Manual check against running backend**

Start backend (`npm run dev --workspace backend`), ensure a module exists, then `npm run dev --workspace frontend`, visit `/library`. Expected: module grid renders.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/components/library frontend/app/'(student)'
git commit -m "feat(frontend): add library module grid and module detail pages"
```

---

### Task 8: Section view — video player + markdown + progress

**Files:**
- Create: `frontend/src/components/video/VideoPlayer.tsx`
- Create: `frontend/src/components/library/SectionView.tsx`
- Create: `frontend/src/components/library/CompleteButton.tsx`
- Create: `frontend/src/components/library/ProgressBar.tsx`
- Create: `frontend/app/(student)/library/[moduleId]/[sectionId]/page.tsx`
- Test: `frontend/tests/components/video.test.tsx`

**Interfaces:**
- Consumes: `requireUser`, `fetchSection`, `fetchVideoMetadata`, `fetchProgress`, `completeProgress`, `updateProgress` (Task 3, 6).
- Produces:
  - `VideoPlayer` (client) — renders a `<video>` with `videoUrl` and shows metadata (duration, tags).
  - `SectionView` — video + markdown + complete button.
  - `CompleteButton` (client) — calls `completeProgress`, toggles completed state.
  - `ProgressBar` — shows `lastPositionSeconds` when present.

- [ ] **Step 1: Write the failing test**

`frontend/tests/components/video.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import CompleteButton from '@/components/library/CompleteButton'

describe('CompleteButton', () => {
  it('renders complete state', () => {
    render(<CompleteButton sectionId="s1" completed={true} onComplete={() => {}} />)
    expect(screen.getByText(/completed/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test --workspace frontend`
Expected: FAIL — component missing.

- [ ] **Step 3: Implement components**

`frontend/src/components/library/CompleteButton.tsx`:
```tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'

export default function CompleteButton({ sectionId, completed, onComplete }: { sectionId: string; completed: boolean; onComplete: () => void }) {
  const [done, setDone] = useState(completed)
  const [loading, setLoading] = useState(false)

  async function onClick() {
    setLoading(true)
    await fetch(`/api/progress/${sectionId}/complete`, { method: 'PATCH' }).catch(() => {})
    setDone(true)
    setLoading(false)
    onComplete()
  }

  return (
    <Button variant={done ? 'ghost' : 'primary'} onClick={onClick} disabled={done || loading}>
      {done ? 'Completed ✓' : 'Mark complete'}
    </Button>
  )
}
```

Note: this calls `/api/progress/...` which does not exist yet — the client proxies are added in Task 9 (search) and Task 10 (progress). To keep this task self-contained, add the proxy route handlers in Task 9 and note the dependency. Alternatively, call the API client directly from a client component using the token passed via props — but the httpOnly cookie is server-only. Therefore the proxy route handlers MUST be added before CompleteButton works at runtime; the tests here only assert render behavior, so they pass without the proxy.

`frontend/src/components/library/ProgressBar.tsx`:
```tsx
export default function ProgressBar({ lastPositionSeconds }: { lastPositionSeconds: number | null }) {
  if (lastPositionSeconds == null) return null
  const label = `${Math.floor(lastPositionSeconds / 60)}m ${lastPositionSeconds % 60}s`
  return <p className="text-sm">Resume at {label}</p>
}
```

`frontend/src/components/video/VideoPlayer.tsx`:
```tsx
'use client'

import type { VideoMetadata } from '@/types'

export default function VideoPlayer({ src, metadata }: { src: string; metadata?: VideoMetadata | null }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-surface-raised">
      <video controls src={src} className="aspect-video w-full" preload="metadata" />
      {metadata && (
        <div className="flex flex-wrap gap-2 p-4 text-sm">
          <span className="rounded-full bg-ink/10 px-3 py-1">{metadata.difficulty}</span>
          <span className="rounded-full bg-ink/10 px-3 py-1">{metadata.primaryStyle}</span>
          <span className="rounded-full bg-ink/10 px-3 py-1">{metadata.videoType}</span>
          {metadata.durationSeconds && <span className="px-1 py-1">{metadata.durationSeconds}s</span>}
        </div>
      )}
    </div>
  )
}
```

Note: Task 2 pinned `video.js` but the plan uses a native `<video>` element for v1 to avoid SSR friction. If the design decision is to use video.js, wrap it in `dynamic(..., { ssr: false })` and mount it in `useEffect`. Native element is acceptable and simplest for v1; upgrade to video.js/pyr in a follow-up.

`frontend/src/components/library/SectionView.tsx`:
```tsx
import VideoPlayer from '@/components/video/VideoPlayer'
import CompleteButton from './CompleteButton'
import ProgressBar from './ProgressBar'
import type { Section, VideoMetadata } from '@/types'

export default function SectionView({ section, metadata, lastPositionSeconds, completed }: { section: Section; metadata?: VideoMetadata | null; lastPositionSeconds: number | null; completed: boolean }) {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">{section.title}</h1>
      {section.description && <p>{section.description}</p>}
      {section.videoUrl && <VideoPlayer src={section.videoUrl} metadata={metadata} />}
      <ProgressBar lastPositionSeconds={lastPositionSeconds} />
      <div className="flex items-center gap-3">
        <CompleteButton sectionId={section.id} completed={completed} onComplete={() => {}} />
      </div>
      {section.markdownContent && (
        <article className="prose prose-slate max-w-none rounded-2xl bg-surface-raised p-6">
          <pre className="whitespace-pre-wrap font-sans">{section.markdownContent}</pre>
        </article>
      )}
    </div>
  )
}
```

Note: `prose` requires `@tailwindcss/typography`. Add it as a devDependency and register in `tailwind.config.ts` plugins (`import typography from '@tailwindcss/typography'`). For v1 the `<pre>` renderer is acceptable; a markdown renderer (react-markdown) can be a follow-up.

- [ ] **Step 4: Implement the section page**

`frontend/app/(student)/library/[moduleId]/[sectionId]/page.tsx`:
```tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { requireUser } from '@/lib/user'
import { fetchSection, fetchVideoMetadata, fetchProgress } from '@/lib/api'
import SectionView from '@/components/library/SectionView'

export const metadata: Metadata = { title: 'Lesson' }

export default async function SectionPage({ params }: { params: Promise<{ moduleId: string; sectionId: string }> }) {
  const { token } = await requireUser(['STUDENT', 'INSTRUCTOR', 'ADMIN'])
  const { moduleId, sectionId } = await params

  let section
  try {
    section = await fetchSection(token, moduleId, sectionId)
  } catch {
    notFound()
  }

  let metadata = null
  try {
    metadata = await fetchVideoMetadata(token, moduleId, sectionId)
  } catch {
    /* metadata optional */
  }

  let progress = null
  try {
    progress = await fetchProgress(token, sectionId)
  } catch {
    /* progress optional */
  }

  return (
    <SectionView
      section={section}
      metadata={metadata}
      lastPositionSeconds={progress?.lastPositionSeconds ?? null}
      completed={Boolean(progress?.completedAt)}
    />
  )
}
```

- [ ] **Step 5: Run tests + typecheck**

Run: `npm test --workspace frontend && npm run typecheck --workspace frontend`
Expected: PASS + clean.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/components/video frontend/src/components/library frontend/app/'(student)'
git commit -m "feat(frontend): add section view with video player and progress controls"
```

---

### Task 9: Client API proxy route handlers + Search page

Add a generic authenticated proxy so client components can call the backend without exposing the JWT. Then build the student search page.

**Files:**
- Create: `frontend/app/api/proxy/[...path]/route.ts`
- Create: `frontend/src/components/search/SearchForm.tsx`
- Create: `frontend/src/components/search/SearchResults.tsx`
- Create: `frontend/app/(student)/search/page.tsx`
- Test: `frontend/tests/components/search.test.tsx`

**Interfaces:**
- Consumes: `getSessionToken`, `searchVideos` (Task 3).
- Produces:
  - `PATCH /api/progress/:sectionId/complete` → proxies to backend `PATCH /sections/:sectionId/progress/complete` (fixes Task 8's dependency).
  - `PATCH /api/progress/:sectionId` → proxies to `PATCH /sections/:sectionId/progress`.
  - Generic `proxy` route forwarding to backend for GET/POST/PATCH/DELETE.
  - `SearchForm` (client) — keyword + style/difficulty/type selects.
  - `SearchResults` — list of metadata cards linking to sections.

- [ ] **Step 1: Write the failing test**

`frontend/tests/components/search.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import SearchResults from '@/components/search/SearchResults'

describe('SearchResults', () => {
  it('renders result titles', () => {
    render(<SearchResults results={[{ id: 'v1', sectionId: 's1', difficulty: 'BEGINNER', primaryStyle: 'MAMBO_ON2', videoType: 'STEP_BREAKDOWN' }]} />)
    expect(screen.getAllByText(/MAMBO_ON2|BEGINNER/).length).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test --workspace frontend`
Expected: FAIL — component missing.

- [ ] **Step 3: Implement the proxy route handler**

`frontend/app/api/proxy/[...path]/route.ts`:
```ts
import { NextRequest, NextResponse } from 'next/server'
import { siteConfig } from '@/config/site'
import { getSessionToken } from '@/lib/session'

const base = siteConfig.apiUrl

async function proxy(req: NextRequest, path: string, method: string) {
  const token = await getSessionToken()
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = req.method === 'GET' || req.method === 'HEAD' ? undefined : await req.text()
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` }
  if (body) headers['Content-Type'] = req.headers.get('content-type') ?? 'application/json'

  const res = await fetch(`${base}/${path}${req.nextUrl.search}`, { method, headers, body })
  const text = await res.text()
  return new NextResponse(text, {
    status: res.status,
    headers: { 'Content-Type': res.headers.get('content-type') ?? 'application/json' },
  })
}

export function GET(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return ctx.params.then(({ path }) => proxy(req, path.join('/'), 'GET'))
}
export function POST(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return ctx.params.then(({ path }) => proxy(req, path.join('/'), 'POST'))
}
export function PATCH(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return ctx.params.then(({ path }) => proxy(req, path.join('/'), 'PATCH'))
}
export function DELETE(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return ctx.params.then(({ path }) => proxy(req, path.join('/'), 'DELETE'))
}
```

- [ ] **Step 4: Implement search components**

`frontend/src/components/search/SearchForm.tsx`:
```tsx
'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const styles = ['MAMBO_ON2', 'CASINO', 'SENSUAL_BACHATA']
const difficulties = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED']
const types = ['STEP_BREAKDOWN', 'COMBINATION', 'FULL_PATTERN', 'SHINES_SEQUENCE']

export default function SearchForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [search, setSearch] = useState(params.get('search') ?? '')

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const qs = new URLSearchParams()
    if (search.trim()) qs.set('search', search.trim())
    router.push(`/search?${qs.toString()}`)
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search lessons…"
        className="w-full rounded-lg border border-ink/15 bg-surface-raised px-3 py-2"
      />
      <button type="submit" className="rounded-lg bg-accent px-4 py-2 font-medium text-white">
        Search
      </button>
    </form>
  )
}
```

Note: filters (style/difficulty/type) can be added as `<select>`s that update the query string the same way. For v1, keyword search plus the three selects is the target; extend `onSubmit` to read each select's value and set the qs.

`frontend/src/components/search/SearchResults.tsx`:
```tsx
import Link from 'next/link'
import type { VideoMetadata } from '@/types'

export default function SearchResults({ results }: { results: VideoMetadata[] }) {
  if (results.length === 0) return <p className="text-sm">No results.</p>
  return (
    <ul className="space-y-2">
      {results.map((r) => (
        <li key={r.id}>
          <Link href={`/library/${r.sectionId}`} className="flex items-center justify-between rounded-xl bg-surface-raised px-4 py-3">
            <span>{r.primaryStyle} · {r.difficulty}</span>
            <span className="text-sm">{r.videoType}</span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
```

Note: `/search` results return `VideoMetadata` which has `sectionId` but not `moduleId`. The backend search response doesn't include the module. For the link to work, fetch the section via proxy or accept a placeholder link. For v1, link to `/library/${r.sectionId}` and handle a missing route gracefully, or link to `/search` results detail later. Adjust after integration testing with the real API.

- [ ] **Step 5: Implement the search page**

`frontend/app/(student)/search/page.tsx`:
```tsx
import type { Metadata } from 'next'
import { requireUser } from '@/lib/user'
import { searchVideos } from '@/lib/api'
import SearchForm from '@/components/search/SearchForm'
import SearchResults from '@/components/search/SearchResults'

export const metadata: Metadata = { title: 'Search' }

export default async function SearchPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { token } = await requireUser(['STUDENT', 'INSTRUCTOR', 'ADMIN'])
  const sp = await searchParams
  const one = (k: string) => (Array.isArray(sp[k]) ? sp[k]?.[0] : sp[k])

  const data = await searchVideos(token, {
    search: one('search'),
    primaryStyle: one('primaryStyle'),
    difficulty: one('difficulty'),
    videoType: one('videoType'),
    page: Number(one('page') ?? '1'),
    limit: 12,
  })

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">Search</h1>
      <SearchForm />
      <SearchResults results={data.videoMetadata} />
    </div>
  )
}
```

- [ ] **Step 6: Run tests + typecheck**

Run: `npm test --workspace frontend && npm run typecheck --workspace frontend`
Expected: PASS + clean.

- [ ] **Step 7: Commit**

```bash
git add frontend/app/api/proxy frontend/src/components/search frontend/app/'(student)'
git commit -m "feat(frontend): add API proxy, progress endpoints, and search page"
```

---

### Task 10: Progress page

**Files:**
- Create: `frontend/src/components/progress/ProgressList.tsx`
- Create: `frontend/app/(student)/progress/page.tsx`
- Test: `frontend/tests/components/progress.test.tsx`

**Interfaces:**
- Consumes: `requireUser`, `fetchAllProgress`, `fetchModule`, `fetchSection` (Task 3, 6).
- Produces: student's progress overview listing sections with completion status.

- [ ] **Step 1: Write the failing test**

`frontend/tests/components/progress.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ProgressList from '@/components/progress/ProgressList'

describe('ProgressList', () => {
  it('shows empty state', () => {
    render(<ProgressList items={[]} />)
    expect(screen.getByText(/no progress/i)).toBeInTheDocument()
  })

  it('shows a completed item', () => {
    render(<ProgressList items={[{ sectionId: 's1', completedAt: '2026-01-01', lastPositionSeconds: null, href: '/x' }]} />)
    expect(screen.getByText(/completed/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test --workspace frontend`
Expected: FAIL — component missing.

- [ ] **Step 3: Implement ProgressList**

`frontend/src/components/progress/ProgressList.tsx`:
```tsx
import Link from 'next/link'

interface ProgressItem {
  sectionId: string
  completedAt: string | null
  lastPositionSeconds: number | null
  title?: string
  href: string
}

export default function ProgressList({ items }: { items: ProgressItem[] }) {
  if (items.length === 0) return <p className="text-sm">No progress yet.</p>
  return (
    <ul className="space-y-2">
      {items.map((p) => (
        <li key={p.sectionId}>
          <Link href={p.href} className="flex items-center justify-between rounded-xl bg-surface-raised px-4 py-3">
            <span>{p.title ?? p.sectionId}</span>
            <span className="text-sm">{p.completedAt ? 'Completed ✓' : 'In progress'}</span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
```

- [ ] **Step 4: Implement the progress page**

`frontend/app/(student)/progress/page.tsx`:
```tsx
import type { Metadata } from 'next'
import { requireUser } from '@/lib/user'
import { fetchAllProgress } from '@/lib/api'
import ProgressList from '@/components/progress/ProgressList'

export const metadata: Metadata = { title: 'My Progress' }

export default async function ProgressPage() {
  const { token } = await requireUser(['STUDENT', 'INSTRUCTOR', 'ADMIN'])
  const data = await fetchAllProgress(token, { page: 1, limit: 50 })

  const items = data.progress.map((p) => ({
    sectionId: p.sectionId,
    completedAt: p.completedAt,
    lastPositionSeconds: p.lastPositionSeconds,
    href: `/library/${p.sectionId}`,
  }))

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">My Progress</h1>
      <ProgressList items={items} />
    </div>
  )
}
```

Note: `GET /progress` returns `{ progress, pagination }` with only `sectionId` (no module). Titles are unavailable without extra fetches; for v1 show sectionId or fetch sections in a follow-up. Adjust the href after integration testing.

- [ ] **Step 5: Run tests + typecheck**

Run: `npm test --workspace frontend && npm run typecheck --workspace frontend`
Expected: PASS + clean.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/components/progress frontend/app/'(student)'
git commit -m "feat(frontend): add progress overview page"
```

---

### Task 11: Admin dashboard — module management

**Files:**
- Create: `frontend/src/components/admin/ModuleForm.tsx`
- Create: `frontend/src/components/admin/ModuleAdminList.tsx`
- Create: `frontend/app/(admin)/layout.tsx`
- Create: `frontend/app/(admin)/admin/page.tsx`
- Create: `frontend/app/(admin)/admin/modules/[moduleId]/page.tsx`
- Test: `frontend/tests/components/admin.test.tsx`

**Interfaces:**
- Consumes: `requireUser`, `fetchModules`, `createModule`, `updateModule`, `deleteModule`, `fetchModule`, `createSection`, `deleteSection` (Task 3, 6).
- Produces:
  - `AdminLayout` gated to INSTRUCTOR/ADMIN.
  - Module admin list (create/edit/delete).
  - Module detail admin page listing sections with create/delete.

- [ ] **Step 1: Write the failing test**

`frontend/tests/components/admin.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ModuleAdminList from '@/components/admin/ModuleAdminList'

describe('ModuleAdminList', () => {
  it('renders modules with edit links', () => {
    render(<ModuleAdminList modules={[{ id: 'm1', title: 'Mambo On2', sectionCount: 2, href: '/admin/modules/m1' }]} />)
    expect(screen.getByText('Mambo On2')).toBeInTheDocument()
    expect(screen.getByText(/edit/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test --workspace frontend`
Expected: FAIL — component missing.

- [ ] **Step 3: Implement admin components**

`frontend/src/components/admin/ModuleForm.tsx` (client, create + edit):
```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function ModuleForm({ id, initial }: { id?: string; initial?: { title: string; description?: string | null } }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const form = new FormData(e.currentTarget)
    const body = JSON.stringify({
      title: String(form.get('title')),
      description: String(form.get('description') ?? ''),
      ...(id ? {} : { orderIndex: 0 }),
    })
    const path = id ? `/api/proxy/modules/${id}` : '/api/proxy/modules'
    const res = await fetch(path, { method: id ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body })
    setLoading(false)
    if (!res.ok) {
      const data = await res.json().catch(() => null)
      setError(data?.error ?? 'Save failed')
      return
    }
    router.push('/admin')
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input label="Title" name="title" defaultValue={initial?.title} required />
      <label className="block">
        <span className="mb-1 block text-sm">Description</span>
        <textarea name="description" defaultValue={initial?.description ?? ''} className="w-full rounded-lg border border-ink/15 bg-surface-raised px-3 py-2" rows={3} />
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={loading}>{loading ? 'Saving…' : id ? 'Save changes' : 'Create module'}</Button>
    </form>
  )
}
```

`frontend/src/components/admin/ModuleAdminList.tsx`:
```tsx
import Link from 'next/link'

export default function ModuleAdminList({ modules }: { modules: { id: string; title: string; sectionCount?: number; href: string }[] }) {
  if (modules.length === 0) return <p className="text-sm">No modules yet.</p>
  return (
    <ul className="space-y-2">
      {modules.map((m) => (
        <li key={m.id} className="flex items-center justify-between rounded-xl bg-surface-raised px-4 py-3">
          <span>{m.title}</span>
          <div className="flex items-center gap-3 text-sm">
            <Link href={m.href}>Edit</Link>
            <Link href={`/admin/modules/${m.id}/sections/new`}>Add section</Link>
          </div>
        </li>
      ))}
    </ul>
  )
}
```

- [ ] **Step 4: Implement admin pages**

`frontend/app/(admin)/layout.tsx`:
```tsx
import Link from 'next/link'
import { requireUser } from '@/lib/user'
import UserNav from '@/components/auth/UserNav'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireUser(['INSTRUCTOR', 'ADMIN'])
  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-10 border-b border-ink/10 bg-surface/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/admin" className="font-semibold">Admin</Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/admin">Modules</Link>
            <Link href="/library">Library</Link>
          </nav>
          <UserNav user={user} />
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  )
}
```

`frontend/app/(admin)/admin/page.tsx` (list + create form):
```tsx
import type { Metadata } from 'next'
import { requireUser } from '@/lib/user'
import { fetchModules } from '@/lib/api'
import ModuleAdminList from '@/components/admin/ModuleAdminList'
import ModuleForm from '@/components/admin/ModuleForm'

export const metadata: Metadata = { title: 'Admin' }

export default async function AdminPage() {
  const { token } = await requireUser(['INSTRUCTOR', 'ADMIN'])
  const data = await fetchModules(token, { page: 1, limit: 50 })
  const modules = data.modules.map((m) => ({ id: m.id, title: m.title, sectionCount: m.sectionCount ?? 0, href: `/admin/modules/${m.id}` }))

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-semibold tracking-tight">Modules</h1>
      <ModuleAdminList modules={modules} />
      <section className="rounded-2xl bg-surface-raised p-6">
        <h2 className="mb-4 text-xl font-semibold">New module</h2>
        <ModuleForm />
      </section>
    </div>
  )
}
```

`frontend/app/(admin)/admin/modules/[moduleId]/page.tsx` (module detail + sections + create section + edit module):
```tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { requireUser } from '@/lib/user'
import { fetchModule, deleteSection } from '@/lib/api'
import ModuleForm from '@/components/admin/ModuleForm'

export const metadata: Metadata = { title: 'Edit module' }

export default async function AdminModulePage({ params }: { params: Promise<{ moduleId: string }> }) {
  const { token } = await requireUser(['INSTRUCTOR', 'ADMIN'])
  const { moduleId } = await params
  let module
  try {
    module = await fetchModule(token, moduleId)
  } catch {
    notFound()
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-semibold tracking-tight">{module.title}</h1>
      <section className="rounded-2xl bg-surface-raised p-6">
        <h2 className="mb-4 text-xl font-semibold">Edit module</h2>
        <ModuleForm id={module.id} initial={{ title: module.title, description: module.description }} />
      </section>
      <section>
        <h2 className="mb-4 text-xl font-semibold">Sections</h2>
        <ul className="space-y-2">
          {(module.sections ?? []).map((s) => (
            <li key={s.id} className="flex items-center justify-between rounded-xl bg-surface-raised px-4 py-3">
              <span>{s.title}</span>
              <div className="flex items-center gap-3 text-sm">
                <a href={`/admin/modules/${moduleId}/sections/${s.id}`}>Edit</a>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
```

Note: delete flows for module and section call `deleteModule`/`deleteSection` via the proxy (add a small client `DeleteButton` in this task using `/api/proxy/modules/:id` DELETE and `router.refresh()`).

- [ ] **Step 5: Run tests + typecheck**

Run: `npm test --workspace frontend && npm run typecheck --workspace frontend`
Expected: PASS + clean.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/components/admin frontend/app/'(admin)'
git commit -m "feat(frontend): add admin dashboard and module management"
```

---

### Task 12: Admin section editor — content, video metadata, upload

**Files:**
- Create: `frontend/src/components/admin/SectionForm.tsx`
- Create: `frontend/src/components/admin/ContentEditor.tsx`
- Create: `frontend/src/components/admin/VideoMetadataForm.tsx`
- Create: `frontend/src/components/admin/VideoUpload.tsx`
- Create: `frontend/app/(admin)/admin/modules/[moduleId]/sections/[sectionId]/page.tsx`
- Create: `frontend/app/(admin)/admin/modules/[moduleId]/sections/new/page.tsx`
- Test: `frontend/tests/components/section-editor.test.tsx`

**Interfaces:**
- Consumes: `requireUser`, `fetchSection`, `fetchVideoMetadata`, `fetchContent`, `createSection`, `updateSection`, `createVideoMetadata`, `updateVideoMetadata`, `deleteVideoMetadata`, `updateContent`, `uploadVideo` (Task 3, 6).
- Produces: full section editor (title/desc/order/videoUrl + markdown content editor + video-metadata form + video upload).

- [ ] **Step 1: Write the failing test**

`frontend/tests/components/section-editor.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ContentEditor from '@/components/admin/ContentEditor'

describe('ContentEditor', () => {
  it('renders a textarea with markdown', () => {
    render(<ContentEditor value="# Hello" onChange={() => {}} />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test --workspace frontend`
Expected: FAIL — component missing.

- [ ] **Step 3: Implement content editor**

`frontend/src/components/admin/ContentEditor.tsx`:
```tsx
'use client'

export default function ContentEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-64 w-full rounded-lg border border-ink/15 bg-surface-raised p-3 font-mono text-sm"
        placeholder="Write markdown…"
        aria-label="Content"
      />
      <div className="h-64 overflow-auto rounded-lg border border-ink/10 bg-surface-raised p-3">
        <pre className="whitespace-pre-wrap font-sans">{value || 'Preview'}</pre>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Implement video metadata form + upload**

`frontend/src/components/admin/VideoMetadataForm.tsx`:
```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'

const STYLES = ['MAMBO_ON2', 'CASINO', 'SENSUAL_BACHATA']
const DIFFICULTIES = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED']
const TYPES = ['STEP_BREAKDOWN', 'COMBINATION', 'FULL_PATTERN', 'SHINES_SEQUENCE']

export default function VideoMetadataForm({ moduleId, sectionId, initial }: { moduleId: string; sectionId: string; initial?: { id: string; primaryStyle: string; difficulty: string; videoType: string; tags: string[] } }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const form = new FormData(e.currentTarget)
    const body = {
      primaryStyle: String(form.get('primaryStyle')),
      difficulty: String(form.get('difficulty')),
      videoType: String(form.get('videoType')),
      tags: String(form.get('tags') ?? '').split(',').map((t) => t.trim()).filter(Boolean),
      steps: [],
      influences: [],
      durationCounts: Number(form.get('durationCounts') ?? 0),
    }
    const path = `/api/proxy/modules/${moduleId}/sections/${sectionId}/video-metadata`
    const res = await fetch(path, { method: initial ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    setLoading(false)
    if (!res.ok) {
      const data = await res.json().catch(() => null)
      setError(data?.error ?? 'Save failed')
      return
    }
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Primary style', name: 'primaryStyle', options: STYLES, initial: initial?.primaryStyle },
          { label: 'Difficulty', name: 'difficulty', options: DIFFICULTIES, initial: initial?.difficulty },
          { label: 'Video type', name: 'videoType', options: TYPES, initial: initial?.videoType },
        ].map((f) => (
          <label key={f.name} className="block">
            <span className="mb-1 block text-sm">{f.label}</span>
            <select name={f.name} defaultValue={f.initial} className="w-full rounded-lg border border-ink/15 bg-surface-raised px-3 py-2">
              {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>
        ))}
      </div>
      <label className="block">
        <span className="mb-1 block text-sm">Tags (comma-separated)</span>
        <input name="tags" defaultValue={initial?.tags.join(', ')} className="w-full rounded-lg border border-ink/15 bg-surface-raised px-3 py-2" />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm">Duration counts</span>
        <input name="durationCounts" type="number" min={0} defaultValue={0} className="w-full rounded-lg border border-ink/15 bg-surface-raised px-3 py-2" />
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={loading}>{loading ? 'Saving…' : 'Save metadata'}</Button>
    </form>
  )
}
```

`frontend/src/components/admin/VideoUpload.tsx`:
```tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'

export default function VideoUpload({ moduleId, sectionId }: { moduleId: string; sectionId: string }) {
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setStatus(null)
    const form = new FormData(e.currentTarget)
    const file = form.get('video') as File
    if (!file || file.size === 0) {
      setStatus('Choose a video file.')
      setLoading(false)
      return
    }
    const body = new FormData()
    body.append('video', file)
    const res = await fetch(`/api/proxy/modules/${moduleId}/sections/${sectionId}/upload-video`, { method: 'POST', body })
    setLoading(false)
    setStatus(res.ok ? 'Upload complete.' : `Upload failed (${res.status}).`)
  }

  return (
    <form onSubmit={onUpload} className="space-y-4">
      <input type="file" name="video" accept="video/mp4,video/quicktime,video/x-msvideo,video/x-ms-wmv" />
      <Button type="submit" disabled={loading}>{loading ? 'Uploading…' : 'Upload video'}</Button>
      {status && <p className="text-sm">{status}</p>}
    </form>
  )
}
```

Note: the proxy route must forward `multipart/form-data` bodies. In `Task 9`'s proxy, the body is read via `req.text()`, which breaks multipart. Update the proxy to forward `req.body` (a `ReadableStream`) for `multipart/form-data` content types instead of reading text. The section below updates the proxy.

- [ ] **Step 4b: Update the proxy for multipart uploads**

Modify `frontend/app/api/proxy/[...path]/route.ts` so `proxy()` sends the raw request body stream for uploads:

```ts
const contentType = req.headers.get('content-type') ?? ''
const isMultipart = contentType.includes('multipart/form-data')

const res = await fetch(`${base}/${path}${req.nextUrl.search}`, {
  method,
  headers: { Authorization: `Bearer ${token}`, ...(contentType && isMultipart ? {} : { 'Content-Type': contentType }) },
  body: req.method === 'GET' || req.method === 'HEAD' ? undefined : (isMultipart ? req.body : await req.text()),
})
```

- [ ] **Step 5: Implement the section editor page**

`frontend/app/(admin)/admin/modules/[moduleId]/sections/new/page.tsx`:
```tsx
import type { Metadata } from 'next'
import { requireUser } from '@/lib/user'
import SectionForm from '@/components/admin/SectionForm'

export const metadata: Metadata = { title: 'New section' }

export default async function NewSectionPage({ params }: { params: Promise<{ moduleId: string }> }) {
  const { moduleId } = await params
  await requireUser(['INSTRUCTOR', 'ADMIN'])
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">New section</h1>
      <SectionForm moduleId={moduleId} />
    </div>
  )
}
```

`frontend/app/(admin)/admin/modules/[moduleId]/sections/[sectionId]/page.tsx` (edit + content + metadata + upload):
```tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { requireUser } from '@/lib/user'
import { fetchSection, fetchContent, fetchVideoMetadata } from '@/lib/api'
import SectionForm from '@/components/admin/SectionForm'
import ContentEditorForm from '@/components/admin/ContentEditorForm'
import VideoMetadataForm from '@/components/admin/VideoMetadataForm'
import VideoUpload from '@/components/admin/VideoUpload'

export const metadata: Metadata = { title: 'Edit section' }

export default async function EditSectionPage({ params }: { params: Promise<{ moduleId: string; sectionId: string }> }) {
  const { token } = await requireUser(['INSTRUCTOR', 'ADMIN'])
  const { moduleId, sectionId } = await params

  let section
  try {
    section = await fetchSection(token, moduleId, sectionId)
  } catch {
    notFound()
  }

  let content: string | null = null
  try {
    content = (await fetchContent(token, moduleId, sectionId)).markdownContent
  } catch { /* no content yet */ }

  let metadata = null
  try {
    metadata = await fetchVideoMetadata(token, moduleId, sectionId)
  } catch { /* no metadata yet */ }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold tracking-tight">{section.title}</h1>
      <section className="rounded-2xl bg-surface-raised p-6">
        <h2 className="mb-4 text-xl font-semibold">Details</h2>
        <SectionForm moduleId={moduleId} id={section.id} initial={section} />
      </section>
      <section className="rounded-2xl bg-surface-raised p-6">
        <h2 className="mb-4 text-xl font-semibold">Lesson content</h2>
        <ContentEditorForm moduleId={moduleId} sectionId={sectionId} initial={content ?? ''} />
      </section>
      <section className="rounded-2xl bg-surface-raised p-6">
        <h2 className="mb-4 text-xl font-semibold">Video</h2>
        <VideoUpload moduleId={moduleId} sectionId={sectionId} />
      </section>
      <section className="rounded-2xl bg-surface-raised p-6">
        <h2 className="mb-4 text-xl font-semibold">Video metadata</h2>
        <VideoMetadataForm moduleId={moduleId} sectionId={sectionId} initial={metadata} />
      </section>
    </div>
  )
}
```

- [ ] **Step 6: Implement SectionForm + ContentEditorForm**

`frontend/src/components/admin/SectionForm.tsx` (client): fields title/description/orderIndex/videoUrl; POST/PATCH via `/api/proxy/modules/:moduleId/sections[/:sectionId]`; on save `router.push('/admin/modules/' + moduleId)`.

`frontend/src/components/admin/ContentEditorForm.tsx` (client): wraps `ContentEditor`; save button PATCHes `/api/proxy/modules/:moduleId/sections/:sectionId/content` with `{ markdownContent }`; on success `router.refresh()`.

- [ ] **Step 7: Run tests + typecheck**

Run: `npm test --workspace frontend && npm run typecheck --workspace frontend`
Expected: PASS + clean.

- [ ] **Step 8: Commit**

```bash
git add frontend/src/components/admin frontend/app/'(admin)' frontend/app/api/proxy
git commit -m "feat(frontend): add admin section editor, content, and video upload"
```

---

### Task 13: Design polish + accessibility + error states

Run the impeccable and apple-design guidance on the app surface; add error/empty/loading states; ensure reduced-motion support.

**Files:**
- Modify: `frontend/app/globals.css` (motion tokens, focus-visible)
- Create: `frontend/app/not-found.tsx`
- Create: `frontend/app/error.tsx`
- Create: `frontend/app/loading.tsx`
- Modify: `frontend/app/layout.tsx` (add `prefers-reduced-motion` handling, `Viewport`)

**Interfaces:**
- Consumes: existing pages/layouts.
- Produces: friendly 404/error/loading surfaces; motion disabled under reduced motion.

- [x] **Step 1: Add motion + reduced-motion CSS**

Append to `frontend/app/globals.css`:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
```

- [x] **Step 2: Add error surfaces**

`frontend/app/not-found.tsx`: centered message "Page not found" with a link back to `/library`.

`frontend/app/error.tsx` (client component):
```tsx
'use client'

import { Button } from '@/components/ui/Button'

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface p-4 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Something went wrong</h1>
      <Button onClick={reset}>Try again</Button>
    </div>
  )
}
```

`frontend/app/loading.tsx`: centered spinner (CSS pulse) with `aria-label="Loading"`.

- [x] **Step 3: Run the impeccable detector on the frontend**

Run: `cd frontend && npx impeccable detect src app`
Review output; fix any flagged anti-patterns (overused font, nested cards, gray-on-color, etc.). Where a flagged pattern is intentional, add an inline ignore comment.

- [x] **Step 4: Typecheck + tests**

Run: `npm run typecheck --workspace frontend && npm test --workspace frontend`
Expected: clean + PASS.

- [x] **Step 5: Commit**

```bash
git add frontend/app frontend/src
git commit -m "feat(frontend): add error, not-found, loading surfaces and reduced-motion support"
```

---

### Task 14: Wire into CI + root scripts + docs

**Files:**
- Modify: `.github/workflows/ci.yml` (add frontend job)
- Modify: `frontend/package.json` (add `verify`)
- Modify: `AGENTS.md` (frontend commands already documented; verify)
- Create: `frontend/README.md`
- Modify: `docs/api.md` if `/auth/me` docs were missed

**Interfaces:**
- Consumes: root monorepo workflow, frontend workspace.
- Produces: CI runs typecheck/lint/test/build for both workspaces.

- [ ] **Step 1: Add `verify` script to frontend**

In `frontend/package.json` scripts add:
```json
"verify": "npm run typecheck && npm run lint && npm test"
```

- [ ] **Step 2: Add frontend job to CI**

Append to `.github/workflows/ci.yml`:
```yaml
  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - name: Install dependencies
        run: npm ci
      - name: Typecheck
        run: npm run typecheck --workspace frontend
      - name: Lint
        run: npm run lint --workspace frontend
      - name: Build
        run: npm run build --workspace frontend
      - name: Test
        run: npm test --workspace frontend
```

- [ ] **Step 3: Write `frontend/README.md`**

Cover: prerequisites (backend running, `NEXT_PUBLIC_API_URL`), `npm run dev --workspace frontend`, test/typecheck commands, seeding an instructor account.

- [ ] **Step 4: Verify both workspaces**

Run from repo root: `npm run typecheck && npm run lint && npm test`
Expected: all workspaces green.

- [ ] **Step 5: Commit**

```bash
git add .github/workflows/ci.yml frontend AGENTS.md
git commit -m "feat(ci): add frontend build, lint, and tests to CI"
```

---

### Task 15: End-to-end smoke verification

**Files:** none (verification only)

- [ ] **Step 1: Start backend + frontend**

Run backend (`npm run dev --workspace backend`) and frontend (`npm run dev --workspace frontend`). Ensure Postgres is running (Docker: `docker run -d --name video-repo-pg -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=admin -e POSTGRES_DB=video_repo -p 5432:5432 postgres:16`) and schema pushed (`npx prisma db push --url "postgresql://postgres:admin@localhost:5432/video_repo"`).

- [ ] **Step 2: Create an instructor + module**

Register an instructor via `curl -X POST localhost:3000/auth/register -d '{"email":"instr@test.com","username":"instr","firstName":"I","lastName":"N","password":"secret123","role":"INSTRUCTOR"}' -H 'Content-Type: application/json'`. Login, then create a module via the API with the returned token.

- [ ] **Step 3: Walk the student flow**

In the browser: sign in → `/library` shows the module → open it → open a section → video player renders (or "no video" state) → mark complete → `/progress` shows it.

- [ ] **Step 4: Walk the admin flow**

In the browser: `/admin` → create a module → add a section → write content → save metadata → upload a small video → verify it appears on the student side.

- [ ] **Step 5: Fix any integration issues found**

Adjust routes/proxy/mappings (search result links, progress titles) as discovered. Re-run typecheck + tests.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "fix(frontend): resolve integration issues found in end-to-end verification"
```

---

## Post-Plan Notes

- **Known backend gap:** `GET /auth/me` is the only backend change. If during verification the `/search` or `/progress` response shapes differ from `docs/api.md`, adjust the frontend types (`frontend/src/types/index.ts`) to match reality — do NOT change the backend contract beyond `/auth/me`.
- **video.js decision:** Task 2 installs `video.js`; Task 8 uses a native `<video>` element for v1 to avoid SSR friction. Wrapping in `dynamic({ ssr: false })` with video.js is an acceptable upgrade within Task 8 if preferred; keep the component interface (`VideoPlayer` with `src` + optional `metadata`) stable.
- **Markdown rendering:** Task 8 renders markdown as preformatted text. Upgrade to `react-markdown` (with `@tailwindcss/typography`'s `prose`) is an acceptable follow-up inside Task 8 or a later task.