# Frontend Instructions

Applies to `frontend/`.

Frontend stack:

- Next.js 15 App Router
- React 19
- TypeScript
- Tailwind CSS
- Vitest + React Testing Library

## Architecture

Content navigation follows:

```text
Course
→ Module
→ Section
→ Lesson content/video
```

Main authenticated navigation uses `/courses`.

Legacy `/library` routes may still exist but are not the primary flow.

API access should preserve the existing proxy architecture:

```text
Frontend
→ /api/proxy/[...]
→ backend
```

The authentication token `video_repo_token` is an httpOnly cookie and must not be exposed to client-side JavaScript.

## Rules

- Preserve existing App Router conventions.
- Respect Server Component vs Client Component boundaries.
- Do not move server-only cookie/session logic into client components.
- Reuse existing API helpers and domain types.
- Do not bypass the authenticated proxy unless the existing architecture explicitly requires it.
- Do not duplicate backend contracts locally when a canonical type already exists.
- Match existing component, hook, routing, and styling patterns.
- Do not combine functional changes with unrelated UI cleanup.
- Preserve accessibility and reduced-motion behavior.

## Debugging Context

For frontend bugs, inspect only the relevant path through:

```text
page/layout/component
→ props/state/hooks
→ lib/API helper
→ proxy
→ backend contract
```

Do not assume the visible component is the root cause.

## Verification

```bash
npm run typecheck --workspace frontend
npm run lint --workspace frontend
npm test --workspace frontend
npm run build --workspace frontend
```

Use the narrowest relevant command first.