---
trigger: always_on
---

# Development and Architecture Rules

Use these rules together with `docs/handbook/02_architecture.md` and `docs/handbook/03_feature_development.md`.

## Feature Boundary

- Keep feature code under `src/features/[feature]/`.
- Routes in `src/routes/` compose cross-feature pages.
- Feature components should not become route orchestrators.
- Use `@/*` imports.
- Prefer feature barrels (`@/features/[feature]`) for public feature APIs.
- Never export `server.ts` or server-only modules from a feature barrel.

## Standard Feature Shape

```text
src/features/[feature]/
|-- components/
|-- server.ts
|-- functions.ts
|-- queries.ts
|-- schemas.ts
`-- index.ts
```

## Responsibilities

- `server.ts`: server-only IO, imports `"@tanstack/react-start/server-only"`.
- `functions.ts`: `createServerFn` wrappers and input validation.
- `queries.ts`: query keys, `queryOptions`, and mutation hooks.
- `schemas.ts`: Zod schemas and exported types.
- `components/`: feature-specific UI.
- `index.ts`: client-safe public API only.

## Scoping

- Feature: code owned by a single feature.
- Common: reusable UI/logic used by multiple features.
- Layout: app shell and navigation structure.
- Lib: cross-cutting setup, such as Ky, QueryClient, and error helpers.
