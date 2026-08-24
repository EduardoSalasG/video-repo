# Dance Education Platform

A monorepo that provides a REST API (backend) and a React SPA (frontend) for a dance‑learning web application.

---

## Architecture

```
video-repo/
├─ backend/          # Express + Prisma + PostgreSQL
│   ├─ src/
│   │   ├─ controllers   # request handlers
│   │   ├─ models        # Prisma DB access
│   │   ├─ routes        # Express routers
│   │   ├─ middleware    # auth, validation, etc.
│   │   ├─ utils         # password hashing, token generation
│   │   └─ validators    # Zod schemas
│   ├─ prisma/
│   │   └─ schema.prisma
│   ├─ .env            # DATABASE_URL, JWT_SECRET, PORT
│   ├─ Dockerfile
│   └─ package.json
├─ frontend/         # Next.js 15 App Router, React 19, TypeScript, Tailwind CSS
│   ├─ app/
│   │   ├─ (auth)      # login / register pages
│   │   ├─ (admin)     # admin‑only routes (module & section management)
│   │   ├─ (student)   # library, search, progress, section view
│   │   ├─ api/        # proxy route handlers (to hide JWT)
│   │   ├─ layout.tsx  # root layout
│   │   ├─ not-found.tsx
│   │   ├─ error.tsx
│   │   └─ loading.tsx
│   ├─ components/     # reusable UI components (admin, auth, library, search, progress, video)
│   ├─ lib/            # helpers: api client, session (cookie), links, user
│   ├─ tests/          # Vitest + React Testing Library unit tests
│   ├─ tailwind.config.ts
│   ├─ postcss.config.js
│   ├─ tsconfig.json
│   └─ package.json
└─ package.json      # root – defines workspaces and global scripts
```

* **Backend** – exposes a JSON API under `/auth/*`, `/modules/*`, `/sections/*`, `/video-metadata/*`, `/upload-video/*`, `/search`, `/progress`.  
* **Frontend** – consumes the API through a **proxy** (`/api/proxy/[...]`) so the JWT‑cookie (`video_repo_token`) is never exposed to browser‑side JavaScript.  
* **Authentication** – JWT stored in an **httpOnly, SameSite=Lax** cookie; middleware checks the cookie and redirects unauthenticated requests to `/login`.  
* **Style** – Tailwind CSS (with `@tailwindcss/typography` for prose) and a custom design system inspired by Apple’s impeccable design principles (tinted surfaces, translucent chrome, spring‑based motion, reduced‑motion support).

---

## Main Packages (selected)

| Workspace | Package | Purpose |
|-----------|---------|---------|
| backend   | `express` | HTTP server |
|           | `prisma`  | ORM & migrations |
|           | `@prisma/client` | Generated client |
|           | `bcryptjs` | Password hashing |
|           | `jsonwebtoken` | JWT creation/verification |
|           | `zod` | Runtime validation |
|           | `dotenv` | Load `.env` |
| frontend  | `next` | React framework (App Router) |
|           | `react` / `react-dom` | UI library |
|           | `typescript` | Static typing |
|           | `tailwindcss` | Utility‑first CSS |
|           | `@tailwindcss/typography` | Prose styling |
|           | `vitest` | Test runner |
|           | `@testing-library/react` | React testing utilities |
|           | `axios` (optional) | HTTP calls (wrapped in custom `api.ts`) |
| root      | `docker` (via scripts) | Local PostgreSQL for dev |

---

## Main Commands (run from the repository root)

| Script | Description |
|--------|-------------|
| `npm run dev` | Starts the **backend** in development mode (`ts-node-dev`). |
| `npm run dev --workspace frontend` | Starts the **frontend** Next.js dev server (`next dev -p 3001`). |
| `npm run db:start` | Launches a persistent PostgreSQL container (`docker run … -v ./db/postgres:/var/lib/postgresql/data`). |
| `npm run db:stop` | Stops & removes the DB container. |
| `npm run db:restart` | Restarts the DB container. |
| `npm run typecheck` | Runs `tsc --noEmit` on both workspaces. |
| `npm run lint` | Runs ESLint on both workspaces. |
| `npm run test` | Runs Vitest on both workspaces. |
| `npm run verify` | Shortcut for `typecheck && lint && test`. |
| `npm run build --workspace backend` | Produces a production‑ready backend bundle (`tsc`). |
| `npm run build --workspace frontend` | Creates an optimized Next.js build (`next build`). |
| `npm run start --workspace frontend` | Serves the frontend production build (`next start -p 3001`). |
| `npm run start --workspace backend` | Runs the compiled backend (`node dist/index.js`). |

*All scripts respect the workspace structure – you can omit `--workspace <name>` when you want the command to run in **both** workspaces (e.g., `npm run typecheck`).*

---

## Project Structure (high‑level)

```
video-repo/
├─ .gitignore
├─ package.json          # root – workspaces & global scripts
├─ README.md             # <-- this file
├─ db/                   # (gitignored) PostgreSQL data volume
│   └─ postgres/
├─ backend/
│   ├─ src/
│   │   ├─ controllers/
│   │   ├─ middleware/
│   │   ├─ routes/
│   │   ├─ models/
│   │   ├─ utils/
│   │   └─ validators/
│   ├─ prisma/
│   │   ├─ schema.prisma
│   │   └─ prisma.config.ts   # tells Prisma to read DATABASE_URL from env
│   ├─ .env
│   ├─ Dockerfile
│   ├─ package.json
│   └─ tsconfig.json
├─ frontend/
│   ├─ app/
│   │   ├─ (auth)/
│   │   ├─ (admin)/
│   │   ├─ (student)/
│   │   ├─ api/
│   │   ├─ components/
│   │   ├─ lib/
│   │   └─ tests/
│   ├─ tailwind.config.ts
│   ├─ postcss.config.js
│   ├─ tsconfig.json
│   ├─ package.json
│   └─ .eslintrc.js
└─ ... (other config files)
```

---

## Getting Started

1. **Clone the repo**  
   ```bash
   git clone https://github.com/EduardoSalasG/video-repo.git
   cd video-repo
   ```

2. **Start the database** (persistent volume)  
   ```bash
   npm run db:start
   ```

3. **Apply the Prisma schema**  
   ```bash
   # Make sure the backend .env points to localhost:5433/video_repo
   npx prisma db push   # or your existing migrate script
   ```

4. **Install dependencies** (run once)  
   ```bash
   npm install
   ```

5. **Run the development servers**  
   ```bash
   # Terminal 1 – backend
   npm run dev
   # Terminal 2 – frontend
   npm run dev --workspace frontend
   ```

6. **Open the app** – visit <http://localhost:3001>.  
   - Sign up → you’ll receive a JWT cookie (`video_repo_token`).  
   - Log in → you stay logged in and are redirected to `/library`.  
   - Admins/instructors can access `/admin` after signing up with `role: INSTRUCTOR` or `ADMIN`.

7. **Stop the containers** when you’re done  
   ```bash
   npm run db:stop   # stops the Postgres container
   # (backend & frontend dev servers stop with Ctrl+C)
   ```

---

## License

ISC – see the root `package.json` for details.

---  

*Happy coding!*