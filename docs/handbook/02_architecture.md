# Architecture

Agentick-FE uses feature-based frontend architecture with route-level orchestration.

## Directory Map

```text
src/
|-- components/
|   |-- ui/           # shadcn-style primitives and molecules
|   |-- common/       # reusable organisms
|   |-- layout/       # app shell components
|   `-- decorations/  # non-core decorative components
|-- configs/          # environment and config objects
|-- constants/        # shared constants and option lists
|-- features/         # feature modules
|-- hooks/            # shared hooks
|-- lib/              # cross-cutting setup and helpers
|-- routes/           # TanStack Router route tree
|-- stores/           # global client state
`-- types/            # shared TypeScript types
```

## Architecture Principles

- A feature owns its own schemas, query options, mutations, server functions, and feature-specific components.
- Routes compose features into pages and decide which data is critical.
- Shared components in `components/common` must be reusable across multiple features.
- Layout components in `components/layout` are app-shell concerns, not feature-specific concerns.
- Cross-cutting library setup belongs in `src/lib`.

## Feature Boundary

Standard feature shape:

```text
src/features/[feature]/
|-- components/
|-- server.ts
|-- functions.ts
|-- queries.ts
|-- schemas.ts
`-- index.ts
```

Responsibilities:

| File | Responsibility |
|---|---|
| `server.ts` | Server-only IO and Ky/API calls |
| `functions.ts` | `createServerFn` wrappers and validation |
| `queries.ts` | Query key factories, `queryOptions`, mutation hooks |
| `schemas.ts` | Zod schemas and exported types |
| `components/` | Feature UI |
| `index.ts` | Client-safe public API |

## Barrel Rule

Feature internals are private by default.

Use:

```ts
import { projectQueryOptions } from "@/features/projects"
```

Avoid:

```ts
import { projectQueryOptions } from "@/features/projects/queries"
```

Exception: direct imports may be used when there is an intentional internal boundary, but do not make that the default.

Never export `server.ts` or modules marked with `"@tanstack/react-start/server-only"` from `index.ts`.

## Route Orchestration

Routes own page-level composition:

- Pull widgets from multiple features.
- Decide required vs secondary data.
- Add route-level `errorComponent` / `notFoundComponent` where needed.
- Keep feature modules decoupled from each other.

Feature A should not import Feature B's page widget just to compose a route. Put that composition in `src/routes`.

## QueryClient Lifecycle

The app must not use a request-shared module singleton `QueryClient` for user data.

Expected shape:

- `src/lib/query-client.ts` exports `createQueryClient()`.
- `src/router.tsx` creates a fresh client inside `getRouter()`.
- Router context and `QueryProvider` receive the same client.
- Auth clear/sign-out flows clear the active `useQueryClient()` instance.

## Error Boundaries

Use nested route boundaries for important app areas so one section failure does not replace the whole app shell.

Recommended areas:

- `/dashboard`
- `/dashboard/$teamId`
- `/dashboard/$teamId/team`
- `/dashboard/$teamId/projects/$projectId`
- `/dashboard/$teamId/inbox`
- `/dashboard/$teamId/schedules`
