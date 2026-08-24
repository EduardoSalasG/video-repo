# Frontend – Dance Education Platform (Next.js 15 App Router)

A React SPA built with Next.js 15 (App Router), TypeScript, Tailwind CSS, and Vitest.  
Consumes the backend API via a **proxy** (`/api/proxy/[...]`) so the JWT‑cookie (`video_repo_token`) stays httpOnly and is never exposed to client‑side JavaScript.

## Features

* **Authentication** – login/register pages, automatic redirect to `/library` when a valid cookie is present.
* **Role‑based UI** – `/admin` (module & section management) only visible to `INSTRUCTOR`/`ADMIN`.
* **Library** – paginated module grid, module detail with ordered section list.
* **Section view** – native `<video>` player, markdown lesson content, completion button, progress bar.
* **Search** – keyword + style/difficulty/type filters; results show **section title** and **tags**.
* **Progress** – overview of completed sections, resume‑position indicator.
* **Admin section editor** – edit module/section details, markdown content editor, video‑metadata form (selects for style, difficulty, type, tags), video upload (multipart/form‑data).
* **Hydration‑safe** – `suppressHydrationWarning={true}` applied where browser extensions inject attributes.
* **Design** – Inspired by Apple’s impeccable design: tinted surfaces, translucent chrome, spring‑based motion, respects `prefers-reduced-motion`.
* **Testing** – Vitest + React Testing Library unit tests for components, hooks, and API helpers.
* **Linting** – ESLint + Prettier (via `.eslintrc.js` and `.prettierrc`).

## Project Layout

```
frontend/
├─ app/
│   ├─ (auth)/          # login / register pages
│   │   ├─ layout.tsx   # auth layout (centered)
│   │   ├─ login/page.tsx
│   │   └─ register/page.tsx
│   ├─ (admin)/         # admin‑only routes (protected by middleware)
│   │   ├─ layout.tsx   # admin layout with header & nav
│   │   ├─ page.tsx     # /admin – module list + create form
│   │   ├─ admin/
│   │   │   ├─ ModuleForm.tsx
│   │   │   ├─ ModuleAdminList.tsx
│   │   │   └─ DeleteButton.tsx
│   │   └─ modules/
│   │       ├─ [moduleId]/page.tsx   # edit module + delete button + section list
│   │       └─ modules/[moduleId]/sections/
│   │           ├─ [sectionId]/page.tsx   # edit section (details, content, video, metadata)
│   │           └─ new/page.tsx          # create new section under a module
│   ├─ (student)/       # student‑ facing routes (library, search, progress, section view)
│   │   ├─ layout.tsx   # shared student layout (nav + footer)
│   │   ├─ layout.tsx   # root layout for (student) – actually in app/layout.tsx
│   │   ├─ library/
│   │   │   ├─ page.tsx          # /library – module grid
│   │   │   ├─ [moduleId]/page.tsx   # module detail → section list
│   │   │   └─ [moduleId]/[sectionId]/page.tsx   # section view
│   │   ├─ search/
│   │   │   └─ page.tsx          # /search – form + results
│   │   ├─ progress/
│   │   │   └─ page.tsx          # /progress – progress list
│   │   └─ api/
│   │       └─ proxy/[...]/route.ts   # generic authenticated proxy to backend
│   ├─ components/          # reusable UI bits (auth forms, buttons, inputs, video player, etc.)
│   ├─ lib/                 # helpers: api client, session (cookie), links, user, etc.
│   ├─ tests/               # Vitest + React Testing Library unit tests
│   ├─ tailwind.config.ts
│   ├─ postcss.config.js
│   ├─ tsconfig.json
│   └─ package.json
```

## Environment Variables

Create a `.env.local` (or `.env`) file in the `frontend/` folder. The only required variable is:

| Variable | Example | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3000` | Base URL of the backend API (used by the proxy and direct fetch helpers). |

If omitted, the code defaults to `http://localhost:3000`.

## Scripts (defined in `frontend/package.json`)

| Script | Action |
|--------|--------|
| `dev` | `next dev -p 3001` – start the Next.js dev server (hot reload). |
| `build` | `next build` – produce an optimized production build. |
| `start` | `next start -p 3001` – serve the production build. |
| `typecheck` | `tsc --noEmit`. |
| `lint` | `eslint . --ext .ts,.tsx`. |
| `test` | `vitest run`. |
| `verify` | `typecheck && lint && test`. |
| `db:start` / `db:stop` / `db:restart` | (defined in the **root** `package.json`; they control the Postgres container). |

## Getting Started (frontend)

Assuming the backend is already running on `http://localhost:3000` and the database is initialized:

```bash
# 1️⃣ Install dependencies (once)
npm install

# 2️⃣ Start the dev server
npm run dev --workspace frontend   # or, from the frontend folder: npm run dev

# 3️⃣ Open <http://localhost:3001> in your browser.
```

If you want to test against a production build:

```bash
npm run build --workspace frontend
npm run start --workspace frontend
```

## Key Helper Modules

### `src/lib/api.ts`

Thin wrapper around `fetch` that automatically injects the JWT cookie (read via `getSessionToken()`) and prefixes the request with `NEXT_PUBLIC_API_URL`.  
Exported functions:

* `fetchModules(token, {page, limit})`
* `fetchModule(token, moduleId)`
* `createModule(token, body)` – `POST /modules`
* `updateModule(token, moduleId, body)` – `PATCH /modules/:id`
* `deleteModule(token, moduleId)` – `DELETE /modules/:id`
* `fetchSections(token, moduleId, {page, limit})`
* `fetchSection(token, moduleId, sectionId)`
* `createSection(token, moduleId, body)`
* `updateSection(token, moduleId, sectionId, body)`
* `deleteSection(token, moduleId, sectionId)`
* `fetchVideoMetadata(token, moduleId, sectionId)`
* `createVideoMetadata(token, moduleId, sectionId, body)`
* `updateVideoMetadata(token, moduleId, sectionId, body)`
* `deleteVideoMetadata(token, moduleId, sectionId)`
* `fetchContent(token, moduleId, sectionId)` – returns `{markdownContent}`
* `updateContent(token, moduleId, sectionId, markdownContent)`
* `uploadVideo(token, moduleId, sectionId, file)` – `POST /modules/:moduleId/sections/:sectionId/upload-video`
* `fetchProgress(token, sectionId)` – returns `{completedAt, lastPositionSeconds}`
* `updateProgress(token, sectionId, body)` – `PATCH /sections/:sectionId/progress`
* `completeProgress(token, sectionId)` – `PATCH /sections/:sectionId/progress/complete`
* `fetchAllProgress(token, {page, limit})`
* `searchVideos(token, {search, primaryStyle, difficulty, videoType, page, limit})`

### `src/lib/session.ts`

Handles the **httpOnly** cookie named `video_repo_token`:

* `getSessionToken()` – reads the cookie on the server (via `next/headers`) **or** from `document.cookie` on the client.  
* `setSessionCookie(token)` – server‑only helper (used by auth routes).  
* `clearSessionCookie()` – server‑only helper (logout).  

Both `setSessionCookie` and `clearSessionCookie` are no‑ops on the client (they print a warning if called from the browser).

### `src/lib/links.ts`

Utility `resolveSectionRefs(token, sectionIds)` – given an array of `sectionId`s, calls the backend `/section/:id` endpoint (via the proxy) to retrieve the corresponding `moduleId` and `title`. Used by the search page to build proper `/library/:moduleId/:sectionId` links.

### `src/lib/user.ts`

* `requireUser(allowedRoles?: Role[])` – server‑only helper used in layout/page files to protect routes. Throws `notFound()` or redirects to `/login` if the user is not authenticated or lacks the required role.  
* `getCurrentUser(token)` – returns the decoded user payload from the JWT (used rarely; most server‑side logic relies on the cookie‑based middleware).

## Styling & Design

* **Tailwind CSS** – configured via `tailwind.config.js` (custom colors, font‑sizing, etc.).
* **Typography plugin** – `@tailwindcss/typography` provides the `prose` classes used in markdown rendering (`<article className="prose ...">`).
* **Design principles** – inspired by Apple’s “impeccable” design:
  * Tinted surfaces (`bg-surface-raised`, `bg-surface/70`)
  * Translucent chrome (backdrop‑blur, semi‑transparent overlays)
  * Spring‑based motion (via `framer-motion`‑like CSS transitions where appropriate)
  * Reduced‑motion respect – a global `@media (prefers-reduced-motion: reduce)` rule in `globals.css` that nullifies animations/transitions.
* **Dark mode** – not implemented yet; the surface colors are light‑only.

## Testing

* Unit tests live in `frontend/tests/` (components, helpers, hooks).
* Run `npm test --workspace frontend` from the repo root, or `npm test` inside the `frontend/` folder.
* Tests use **Vitest** with **jsdom** (built‑in) and **@testing-library/react**.
* Mock the `getSessionToken()` helper where needed to simulate authenticated/unauthenticated states.

## Linting & Formatting

* **ESLint** – configured via `.eslintrc.js` (extends `eslint:recommended`, `plugin:@typescript-eslint/recommended`, `next/core-web-vitals`).
* **Prettier** – configured via `.prettierrc` (single‑quote, semi‑colon‑free, trailing comma ES5).
* Both are run via `npm run lint`.
* The `lint` script also fixes fixable issues (`--fix`) when you add `--fix` to the command (e.g., `npm run lint --workspace frontend -- --fix`).

## Production Build & Deployment

```bash
# From the repo root
npm run build --workspace frontend   # creates .next/
npm run start --workspace frontend   # serves on :3001
```

Set `NEXT_PUBLIC_API_URL` to your production backend URL (e.g., `https://api.danceedu.com`).  
The frontend is static‑hostable (any static file host: Vercel, Netlify, AWS S3+CloudFront, etc.) as long as the API URL is reachable.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| `bis_skin_checked="1"` hydration warnings | Browser extension injecting attributes after SSR (password manager, ad‑blocker). | Disable the extension or test in incognito/private window. The warnings are harmless; they’re silenced on the flagged elements with `suppressHydrationWarning={true}`. |
| After login you’re immediately redirected to `/login` | Cookie not being set or blocked. | Verify the login endpoint returns a `Set-Cookie: video_repo_token=…; HttpOnly; SameSite=Lax; Path=/; Max-Age=3600`. Also ensure your browser isn’t blocking cookies for `localhost` (try incognito). |
| Search results show no section title or tags | Proxy to `/section/:id` failing (no auth or network error). | Confirm you’re logged in (cookie present). Check the browser DevTools → Network for requests to `/api/proxy/section/<id>` – they should return `200` with `{id, moduleId, title, …}`. |
| Module/section create/update returns 401/403 | Missing or incorrect role (`INSTRUCTOR`/`ADMIN`). | Ensure your JWT cookie belongs to a user with the appropriate role (you can create one via the registration endpoint with `"role":"INSTRUCTOR"` or `"role":"ADMIN"`). |
| Prisma schema push fails with `P1001` | PostgreSQL container not reachable. | Run `npm run db:start` (from repo root) and verify `docker ps` shows the container healthy. |

---

*Enjoy building and dancing!*  
If you have any questions, feel free to open an issue or reach out to the maintainers.