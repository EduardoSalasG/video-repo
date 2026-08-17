# @video-repo/frontend

Next.js 15 App Router frontend for the Dance Education Platform. Students learn Mambo
On2, Casino, and Sensual Bachata through structured video lessons; instructors and
admins manage modules, sections, content, and video metadata.

## Prerequisites

- Node.js 22+ and npm (root workspaces)
- The backend API running (default `http://localhost:3000`)
- A `.env` file (copy `.env.example`):

  ```bash
  cp .env.example .env
  ```

  `NEXT_PUBLIC_API_URL` defaults to `http://localhost:3000`. Set it to the backend
  URL if the API runs elsewhere.

## Development

From the repo root:

```bash
npm install            # once, links the workspace
npm run dev --workspace frontend
```

The dev server runs on `http://localhost:3001` (the backend uses 3000).

## Scripts

Run from the repo root with `--workspace frontend`:

| Script | Command | Purpose |
| ------ | ------- | ------- |
| dev | `npm run dev --workspace frontend` | Start the dev server on :3001 |
| build | `npm run build --workspace frontend` | Production build |
| start | `npm run start --workspace frontend` | Serve the production build on :3001 |
| typecheck | `npm run typecheck --workspace frontend` | TypeScript strict check |
| lint | `npm run lint --workspace frontend` | ESLint |
| test | `npm test --workspace frontend` | Vitest + Testing Library |
| verify | `npm run verify --workspace frontend` | Typecheck + lint + test |

From inside `frontend/`, the same scripts run without the workspace flag.

## Seeding an instructor account

The backend exposes no dedicated seed script. Create an instructor through the
register endpoint (`role` defaults to `STUDENT` when omitted):

```bash
curl -X POST http://localhost:3000/auth/register \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "instructor@example.com",
    "username": "instructor1",
    "firstName": "Ana",
    "lastName": "Lopez",
    "password": "secret123",
    "role": "INSTRUCTOR"
  }'
```

The response includes an `accessToken` and the created user. Sign in at
`http://localhost:3001/login` to access `/admin` and manage content.

## Notes

- The JWT is stored in an httpOnly `video_repo_token` cookie; client code never
  reads it directly.
- `NEXT_PUBLIC_*` variables are inlined at build time — restart the dev server
  after changing `.env`.
