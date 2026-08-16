# Dance Education Platform — Frontend Design

- **Date:** 2026-08-16
- **Status:** Approved
- **Scope:** Frontend web application for the Dance Education Platform

## 1. Executive Summary

A Next.js web application providing two role-based experiences over the existing
`@video-repo/backend` REST API:

- **Students** browse modules, watch dance tutorial videos (Mambo On2, Casino,
  Sensual Bachata), read markdown lessons, track progress, and search.
- **Instructors/Admins** manage modules, sections, markdown content, video
  metadata, and video uploads.

The app is a single Next.js (App Router) application with role-separated route
groups. Data is fetched with React Server Components; interactive surfaces use
client components. Design follows the installed impeccable and apple-design
skills.

## 2. Tech Stack

| Concern | Choice |
|---------|--------|
| Framework | Next.js 15 (App Router), TypeScript strict |
| Styling | Tailwind CSS |
| Video playback | video.js (or plyr) |
| Auth | JWT via `POST /auth/login`, httpOnly cookie session |
| Data fetching | RSC server components + lightweight client fetch hooks |
| Validation | Zod (shared shapes on the client) |
| Testing | Vitest + React Testing Library; Playwright (later) |
| Design | impeccable (`/impeccable init` → PRODUCT.md/DESIGN.md) + apple-design principles |

## 3. Roles & Access

- **STUDENT** — library, module/section view, video playback, progress, search.
- **INSTRUCTOR** — everything in STUDENT plus `/admin` content management.
- **ADMIN** — all of the above.

Next.js middleware gates route groups by role. Server components resolve the
current user via the backend (`GET /auth/me`) using the JWT from cookies.

> **Required backend addition:** The backend JWT payload contains only `userId`
> (no role), and no endpoint returns the current user. A small
> `GET /auth/me` route (auth-protected, returns the authenticated user's
> `id`, `username`, `email`, `role`, `firstName`, `lastName`) must be added so
> the frontend can resolve role for authorization. This is the only backend
> change required for the frontend.

## 4. Information Architecture & Routing

```
/                        → public landing (marketing)
/login  /register        → public auth (layout group (auth))
/library                 → STUDENT+: module grid w/ search + filters
/library/[moduleId]      → module detail + section list w/ completion states
/library/[moduleId]/[sectionId] → video player + markdown lesson + progress controls
/search                  → STUDENT+: keyword + style/difficulty/type + pagination
/progress                → STUDENT+: my progress overview
/admin                   → INSTRUCTOR+: dashboard (module list + create)
/admin/modules/[id]      → INSTRUCTOR+: sections CRUD
/admin/modules/[id]/sections/[sectionId] → content editor, video-metadata form, upload
```

Route groups: `(auth)`, `(student)`, `(admin)` — each with its own layout and
navigation. Middleware redirects unauthenticated users to `/login` and
unauthorized roles to `/` or `/library`.

## 5. Data Flow

- **Server Components** call a typed API client (`src/lib/api.ts`) with the JWT
  from cookies. Responses validated with Zod.
- **Client components** handle interactivity: video player, "mark complete",
  search filters, admin forms, uploads.
- **Session**: Next.js route handler proxies `POST /auth/login`, stores the JWT
  in an httpOnly cookie. Middleware + server components read it to authorize.
- No global state library required; React state + fetch hooks suffice.

## 6. Components

- `src/components/` shared: Button, Badge, Card, Input, Select, Textarea,
  Modal, Toast, Spinner, EmptyState, Pagination.
- `src/components/video/`: VideoPlayer (video.js), UploadProgress.
- `src/components/library/`: ModuleCard, SectionList, SectionItem, Filters.
- `src/components/forms/`: SectionForm, ContentEditor (markdown w/ preview),
  VideoMetadataForm, ModuleForm.
- Design system follows impeccable's generated DESIGN.md; apple-design for
  motion, materials (`backdrop-filter`), and typography.

## 7. API Integration

Backend base URL via `NEXT_PUBLIC_API_URL` (e.g. `http://localhost:3001`).
Client endpoints used:

- Auth: `POST /auth/register`, `POST /auth/login`, `GET /auth/me` (new)
- Modules: `GET /modules`, `GET /modules/:id`
- Sections: `GET /modules/:moduleId/sections`, `GET .../:sectionId`
- Content: `GET .../content`, `PATCH .../content`
- Video metadata: `GET/POST/PATCH/DELETE .../video-metadata`,
  `POST .../upload-video`
- Search: `GET /search`
- Progress: `GET/PATCH /sections/:id/progress`, `PATCH .../complete`,
  `GET /progress`

## 8. Design Principles (impeccable + apple-design)

- Impeccable anti-patterns: no Inter-only system font, no pure-black/gray (use
  tints), no nested-card soup, no purple gradients, no bounce easing on
  non-momentum UI.
- Apple design: translucent materials for nav/chrome (`backdrop-filter`),
  critically-damped springs (`damping ~1.0`) for interactive elements, bounce
  only on momentum gestures, size-specific letter-spacing/leading, respect
  `prefers-reduced-motion` and `prefers-reduced-transparency`.
- Run `/impeccable init` to generate `PRODUCT.md` and `DESIGN.md` early.

## 9. Error Handling

- Zod-validated API responses; server components render friendly error states.
- Client mutations surface toast messages on success/failure.
- 401 → redirect to `/login`; 403 → access-denied screen.
- Custom `not-found.tsx` and `error.tsx` per route group.

## 10. Testing

- Unit: Vitest + RTL for components, hooks, API client, Zod schemas.
- Integration: RTL for form flows and player interactions (mock API).
- E2E: Playwright for core student + instructor journeys (later phase).
- Target >80% coverage on critical paths (auth, player, progress).

## 11. Repository Layout

```
frontend/
  app/
    (auth)/login/  (auth)/register/
    (student)/library/  (student)/search/  (student)/progress/
    (admin)/admin/
  src/
    components/  lib/  hooks/  types/  config/
  middleware.ts  next.config.ts  tailwind.config.ts
```

Frontend lives in the `frontend/` workspace of the root monorepo, wired into
root npm workspaces, CI, and `npm run dev --workspace frontend`.

## 12. Out of Scope (v1)

- Payments/subscriptions, social features, comments.
- Admin user management (backend has no endpoint yet).
- HLS/adaptive streaming, transcoding (backend stores uploaded files locally).
- Mobile apps.