# Backend – Dance Education Platform API

A Node.js/Express server backed by Prisma and PostgreSQL, exposing a REST API used by the Next.js frontend.

## Features

* JWT-based authentication (httpOnly cookie, SameSite=Lax).
* Role-based access control (STUDENT, INSTRUCTOR, ADMIN).
* Full CRUD for courses, modules, sections, video-metadata, progress, and content (markdown).
* File upload for videos (via multer-style uploadVideo utility).
* Search endpoint (/search) with keyword, style, difficulty, video-type, and course filters.
* Proxy-friendly design – the frontend never sees the JWT; it talks to /api/proxy/[...] which forwards the cookie.
* Prisma ORM with migrations (via prisma migrate dev).
* Docker-friendly – a docker run script (npm run db:start) provides a local Postgres instance.

## Project Layout

```
backend/
├─ src/
│   ├─ controllers/   # request handlers (auth, course, module, section, video, content, progress, search)
│   │   ├─ authController.ts
│   │   ├─ courseController.ts
│   │   ├─ moduleController.ts
│   │   ├─ sectionController.ts
│   │   ├─ videoController.ts
│   │   ├─ contentController.ts
│   │   ├─ progressController.ts
│   │   └─ searchController.ts
│   ├─ middleware/    # authenticateUser, requireInstructor, errorHandler
│   │   ├─ auth.ts
│   │   ├─ role.ts
│   │   └─ errorHandler.ts
│   ├─ routes/        # Express routers mounted in app.ts
│   │   ├─ authRoutes.ts
│   │   ├─ courseRoutes.ts
│   │   ├─ moduleRoutes.ts
│   │   ├─ sectionRoutes.ts
│   │   ├─ videoRoutes.ts
│   │   ├─ contentRoutes.ts
│   │   ├─ progressRoutes.ts
│   │   └─ searchRoutes.ts
│   ├─ models/        # Prisma wrapper functions (findAllSections, createSection, etc.)
│   │   ├─ section.ts
│   │   ├─ module.ts
│   │   ├─ video.ts
│   │   ├─ auth.ts
│   │   ├─ progress.ts
│   │   ├─ course.ts
│   │   └─ user.ts
│   ├─ utils/         # password hashing, token generation, video upload (local disk)
│   │   ├─ password.ts
│   │   ├─ token.ts
│   │   └─ storage.ts
│   ├─ validators/    # Zod schemas for input validation
│   │   ├─ authValidators.ts
│   │   ├─ courseValidators.ts
│   │   ├─ moduleValidators.ts
│   │   ├─ sectionValidators.ts
│   │   ├─ videoValidators.ts
│   │   ├─ contentValidators.ts
│   │   ├─ progressValidators.ts
│   │   └─ searchValidators.ts
│   └─ app.ts         # Express app setup
├─ prisma/
│   ├─ schema.prisma  # DB models (User, Session, Course, Module, Section, VideoMetadata, UserProgress, …)
│   └─ prisma.config.ts   # tells Prisma to read DATABASE_URL from env
├─ .env                # DATABASE_URL, JWT_SECRET, PORT
├─ Dockerfile          # multi-stage build (optional)
├─ package.json
└─ tsconfig.json
```

## Environment Variables

Create a `.env` file in the `backend/` folder (copy from `.env.example` if present). Required keys:

| Variable | Example | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://postgres:admin@localhost:5433/video_repo` | Connection string for Prisma. |
| `JWT_SECRET`   | `a-very-secret-string-change-in-prod` | Secret used to sign/verify JWTs. |
| `PORT`         | `3000` | HTTP port the Express server listens on. |
| `NODE_ENV`     | `development` | (optional) influences logging, etc. |

## Scripts (defined in `backend/package.json`)

| Script | Action |
|--------|--------|
| `dev` | `ts-node-dev --respawn --transpile-only src/index.ts` – hot-reloading dev server. |
| `build` | `tsc` – compile to `dist/`. |
| `start` | `node dist/index.js` – run compiled server. |
| `typecheck` | `tsc --noEmit`. |
| `lint` | `eslint . --ext .ts,.tsx`. |
| `test` | `vitest run` (unit & integration tests). |
| `verify` | `typecheck && lint && test`. |
| `prisma:migrate` | `prisma migrate dev` – creates/updates DB schema. |
| `prisma:studio` | `prisma studio` – open Prisma GUI. |
| `prisma:generate` | `prisma generate` – (re)generate Prisma client. |

## Database Setup (development)

1. **Start PostgreSQL** (persistent volume) – from the repo root:  

   ```bash
   npm run db:start
   ```

   This launches a container named `video-repo-pg` exposing port **5433** → container **5432**.

2. **Apply / update the schema**  

   ```bash
   npx prisma db push   # or: npm run prisma:migrate
   ```

   The Prisma config (`prisma.config.ts`) reads `DATABASE_URL` from the backend’s `.env`.

3. **(Optional) Seed data** – you can create a first admin/instructor via the API:  

   ```bash
   curl -X POST http://localhost:3000/auth/register \
        -H "Content-Type: application/json" \
        -d '{
              "email":"admin@test.com",
              "username":"admin",
              "firstName":"Admin",
              "lastName":"User",
              "password":"secret123",
              "role":"ADMIN"
            }'
   ```

   The response contains a JWT; the cookie will be set automatically by the login endpoint (see login fix below).

## API Overview (selected endpoints)

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| `POST` | `/auth/register` | Register a new user (`role` optional, defaults to `STUDENT`). | – |
| `POST` | `/auth/login` | Login – sets `video_repo_token` httpOnly cookie and returns `{accessToken, user}`. | – |
| `GET`  | `/auth/me` | Returns the currently authenticated user (`{user:{…}}`). | ✅ |
| `GET`  | `/courses/` | List all courses (paginated). | ✅ |
| `GET`  | `/courses/:courseId` | Get a single course. | ✅ |
| `POST` | `/courses/` | Create a course (INSTRUCTOR/ADMIN only). | ✅ + role |
| `PATCH`| `/courses/:courseId` | Update a course. | ✅ + role |
| `DELETE`| `/courses/:courseId` | Delete a course. | ✅ + role |
| `GET`  | `/courses/:courseId/modules` | List modules for a course (paginated). | ✅ |
| `GET`  | `/courses/:courseId/modules/:moduleId` | Get a single module in a course. | ✅ |
| `POST` | `/courses/:courseId/modules` | Create a module in a course (INSTRUCTOR/ADMIN only). | ✅ + role |
| `PATCH`| `/courses/:courseId/modules/:moduleId` | Update a module in a course. | ✅ + role |
| `DELETE`| `/courses/:courseId/modules/:moduleId` | Delete a module in a course. | ✅ + role |
| `GET`  | `/courses/:courseId/modules/:moduleId/sections` | List sections for a module in a course. | ✅ |
| `GET`  | `/courses/:courseId/modules/:moduleId/sections/:sectionId` | Get a single section in a module of a course. | ✅ |
| `POST` | `/courses/:courseId/modules/:moduleId/sections` | Create a section in a module of a course (INSTRUCTOR/ADMIN only). | ✅ + role |
| `PATCH`| `/courses/:courseId/modules/:moduleId/sections/:sectionId` | Update a section in a module of a course. | ✅ + role |
| `DELETE`| `/courses/:courseId/modules/:moduleId/sections/:sectionId` | Delete a section in a module of a course. | ✅ + role |
| `GET`  | `/courses/:courseId/modules/:moduleId/sections/:sectionId/video-metadata` | Get video metadata for a section. | ✅ |
| `POST` | `/courses/:courseId/modules/:moduleId/sections/:sectionId/video-metadata` | Create video metadata. | ✅ + role |
| `PATCH`| `/courses/:courseId/modules/:moduleId/sections/:sectionId/video-metadata` | Update video metadata. | ✅ + role |
| `DELETE`| `/courses/:courseId/modules/:moduleId/sections/:sectionId/video-metadata` | Delete video metadata. | ✅ + role |
| `POST` | `/courses/:courseId/modules/:moduleId/sections/:sectionId/upload-video` | Upload a video file (multipart/form-data). | ✅ + role |
| `GET`  | `/sections/:sectionId/progress` | Get the current user’s progress for a section (includes course context). | ✅ |
| `PATCH`| `/sections/:sectionId/progress` | Upsert progress (lastPositionSeconds). | ✅ |
| `PATCH`| `/sections/:sectionId/progress/complete` | Mark a section as completed. | ✅ |
| `GET`  | `/progress` | Paginated list of the current user’s progress across all sections (includes course context). | ✅ |
| `GET`  | `/search` | Search video metadata (keyword, style, difficulty, type, course, pagination). | ✅ |
| `GET`  | `/api/proxy/[...]` | **Proxy** – forwards the request (with the JWT cookie) to the backend; used by the frontend to avoid exposing the token. | ✅ (cookie forwarded) |

## Testing

* Unit & integration tests live in `backend/tests/`.  
* Run `npm test` (or `npm run test --workspace backend` from the repo root).  
* Tests use an in-memory SQLite database via Prisma’s `datasource.url` override (`:memory:`) – ensure `prisma` version supports it (the provided setup already does).

## Docker (optional)

A simple `Dockerfile` is provided for multi-stage builds:

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runtime stage
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

Build & run:

```bash
docker build -t video-repo-backend .
docker run -d -p 3000:3000 --name video-repo-backend \
  -e DATABASE_URL=postgresql://postgres:admin@host.docker.internal:5433/video_repo \
  -e JWT_SECRET=your_secret \
  video-repo-backend
```

*(Adjust `host.docker.internal` to your Docker host’s IP if needed.)*

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| `Error: The datasource.url property is required…` | Prisma config not picking up `DATABASE_URL`. | Ensure `prisma.config.ts` exists and exports a `datasource` with `url: process.env.DATABASE_URL`. |
| `P1001: Can't reach database server at localhost:5433` | PostgreSQL container not running or wrong port. | Run `npm run db:start` and verify `docker ps` shows `video-repo-pg` with `0.0.0.0:5433->5432/tcp`. |
| Login succeeds but you’re immediately redirected to `/login` again | Cookie not being set or not being sent back by the browser. | Verify the login endpoint sets `Set-Cookie: video_repo_token=…; HttpOnly; SameSite=Lax; Path=/; Max-Age=3600`. Also check that your browser isn’t blocking third‑party cookies (if testing across ports). |
| `bis_skin_checked="1"` hydration warnings in console | Browser extension (password manager, ad‑blocker) injecting attributes after SSR. | Disable the extension or test in an incognito/private window. The warnings are harmless; they can be silenced with `suppressHydrationWarning={true}` on the flagged elements (already applied). |

---

*That’s it – you now have a fully functional backend ready to serve the Dance Education Platform frontend.*