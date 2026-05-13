# TanStack Refactor Knowledge Transfer

This document summarizes the practical lessons learned while standardizing Agentick-FE around TanStack Start, TanStack Router, TanStack Query, Ky, and route-level SSR data loading.

It is intended for future agent sessions and human reviewers. Treat `.agents/rules/4_tanstack_query_start_router.md` as the mandatory rule file, and this document as the reasoning and examples behind those rules.

## 1. Final Pattern

The core rule is simple: **routes decide criticality**.

- If the page cannot render meaningfully without the data, the route loader uses `ensureQueryData`, and the component uses `useSuspenseQuery` or `useSuspenseQueries`.
- If the page can still render without the data, the route may use `prefetchQuery`, and the component uses `useQuery` with local loading, error, and empty states.
- A `prefetchQuery` failure must not be hidden as empty data.
- A Suspense query must be backed by a route loader that guarantees the data.

```ts
// Critical route data
loader: async ({ context, params }) => {
  await context.queryClient.ensureQueryData(projectQueryOptions(params.projectId))
}

const { data: project } = useSuspenseQuery(projectQueryOptions(projectId))
```

```ts
// Secondary widget data
loader: ({ context, params }) => {
  void context.queryClient.prefetchQuery(projectTaskStatsQueryOptions(params.projectId))
}

const { data, isLoading, isError } = useQuery(projectTaskStatsQueryOptions(projectId))
```

## 2. Feature Data Boundary

Each feature keeps the same shape:

```text
src/features/[feature]/
|-- server.ts
|-- functions.ts
|-- queries.ts
|-- schemas.ts
`-- index.ts
```

- `server.ts` imports `"@tanstack/react-start/server-only"` and talks to Ky/API/database.
- `functions.ts` wraps server logic with `createServerFn` and validation.
- `queries.ts` defines key factories, query options, and mutation hooks.
- `index.ts` exports only client-safe public API.
- Never export `server.ts` from a feature barrel.

## 3. Error Contract

Query functions must either return valid data or throw.

Do not do this:

```ts
try {
  return await api.get(...).json()
} catch (error) {
  console.error(error)
  return null
}
```

Use Ky's behavior. Ky throws `HTTPError` for non-2xx responses. Let that error reach TanStack Query unless there is a deliberate domain conversion.

Route-level missing resources should become `notFound()`:

```ts
import { notFound } from "@tanstack/react-router"
import { isHTTPError } from "ky"

export const getProjectByIdFn = createServerFn({ method: "GET" })
  .handler(async ({ data }) => {
    try {
      return await fetchProjectById(data.projectId)
    } catch (error) {
      if (isHTTPError(error) && error.response.status === 404) {
        throw notFound()
      }
      throw error
    }
  })
```

Known examples handled during the refactor:

- Project detail 404 -> `notFound()`.
- Task detail 404 -> `notFound()`.
- Invitation detail 404 -> `notFound()`.
- Team detail 404 -> `notFound()`.

## 4. Suspense vs Local State

Use Suspense only when route data is guaranteed.

Correct:

```ts
loader: async ({ context, params }) => {
  await Promise.all([
    context.queryClient.ensureQueryData(projectQueryOptions(params.projectId)),
    context.queryClient.ensureQueryData(tasksQueryOptions(params.projectId, params)),
  ])
}

const [projectRes, tasksRes] = useSuspenseQueries({
  queries: [
    projectQueryOptions(projectId),
    tasksQueryOptions(projectId, params),
  ],
})
```

Incorrect:

```ts
loader: ({ context, params }) => {
  void context.queryClient.prefetchQuery(tasksQueryOptions(params.projectId))
}

const { data } = useSuspenseQuery(tasksQueryOptions(projectId))
```

That still lets a secondary query failure throw into the route boundary. If the query is truly secondary, use `useQuery` and render local states.

## 5. `enabled` Placement

The final decision from the refactor:

- Required route/Suspense query options should not include `enabled`.
- Optional/search/inline component queries may use `enabled`.
- If one data source needs both modes, create separate explicit option factories.

Good `enabled` cases:

- user search query based on a typed search string.
- optional sidebar project detail when no project is active.
- optional task activity for draft/new task forms without a `taskId`.

Avoid `enabled` in query options consumed by `ensureQueryData` or `useSuspenseQuery`.

## 6. Query Keys and Invalidation

Every feature owns a key factory. Invalidation should use key factory prefixes, not duplicated arrays.

```ts
export const projectKeys = {
  all: ["projects"] as const,
  lists: () => [...projectKeys.all, "list"] as const,
  myProjectsAll: () => [...projectKeys.all, "me"] as const,
  myProjects: (teamId?: string) =>
    [...projectKeys.myProjectsAll(), teamId ?? "all"] as const,
}

await queryClient.invalidateQueries({ queryKey: projectKeys.myProjectsAll() })
```

Useful invalidation lessons:

- Use prefix keys for parametric caches, such as all "my projects" by all team ids.
- Cross-feature mutations may invalidate another feature's root key when the relationship changes.
- Mutation hooks own cache correctness; components own toast, navigation, dialog state, and local UX.

## 7. QueryClient Lifecycle

The app uses a QueryClient factory, not a module-level user-data singleton.

```ts
export function getRouter() {
  const queryClient = createQueryClient()

  const router = createTanStackRouter({
    routeTree,
    context: { queryClient },
  })

  setupRouterSsrQueryIntegration({
    router,
    queryClient,
    wrapQueryClient: false,
  })

  return router
}
```

Root then passes the same client from router context to `QueryProvider`.

This means:

- SSR gets a QueryClient attached to the router/request lifecycle.
- Browser runtime gets one QueryClient for the app tab.
- Auth sign-in/sign-out must clear the active client via `useQueryClient()`, not an imported singleton.

## 8. Error Boundaries

Root `errorComponent` is not enough for an app shell. Important nested layouts should define local boundaries so a section can fail without replacing the entire shell.

Recommended boundaries:

- `/dashboard`
- `/dashboard/$teamId`
- `/dashboard/$teamId/team`
- `/dashboard/$teamId/inbox`
- `/dashboard/$teamId/projects/$projectId`
- `/dashboard/$teamId/schedules`

Use route `notFoundComponent` / `notFound()` for known missing route resources. Let unexpected API/server failures go to the nearest error boundary.

## 9. Local Query Widgets

Optional widgets must distinguish loading, error, and empty:

```tsx
const { data, isLoading, isError } = useQuery(projectStatsQueryOptions(projectId))

if (isLoading) return <StatsSkeleton />
if (isError) return <StatsError />
if (!data.items.length) return <StatsEmpty />

return <StatsChart data={data.items} />
```

Never use `data ?? []` as the only fallback for a query that can fail. That turns failures into fake empty states.

## 10. What Was Fixed In This Refactor

The refactor aligned these areas:

- Removed server fetcher `catch -> return null` style for server-state data.
- Added deliberate 404 -> `notFound()` handling for critical route resources.
- Converted key features to query key factories and `queryOptions` factories.
- Replaced hardcoded invalidation arrays with feature key factory prefixes.
- Aligned project list and board pages to `loader + ensureQueryData + useSuspenseQueries`.
- Kept dashboard stats, schedules, and other secondary widgets local with `useQuery` and local states.
- Added nested error boundaries to important layout routes.
- Confirmed QueryClient lifecycle uses `createQueryClient()` through router context and `QueryProvider`.
- Centralized Ky v2 API error message normalization in `src/lib/ky.ts`.
- Added `getErrorMessage(error, fallback)` in `src/lib/error.ts` and updated mutation/UI error flows to use normalized error messages.

## 11. Ky Normalization: Final Implementation

Ky normalization is implemented centrally and remains separate from the TanStack Query error contract.

What Ky should do centrally in `src/lib/ky.ts`:

- attach auth headers
- perform refresh-token retry
- redirect or clear auth after unrecoverable auth failure
- parse common backend error payload shapes once
- set a useful `error.message`
- return the same thrown `HTTPError`
- keep Ky v2 API root configuration on `prefix`

What Ky must not do:

- return fallback data
- swallow non-2xx responses
- convert API failures into `{ error }` data
- decide route-level domain behavior such as 404 pages
- use `prefixUrl`

Recommended `beforeError` shape:

```ts
import ky, { isHTTPError } from "ky"

beforeError: [
  ({ error }) => {
    if (!isHTTPError(error)) return error

    const fallback = error.message
    const data = error.data

    if (typeof data === "object" && data !== null) {
      const payload = data as {
        message?: unknown
        detail?: unknown
        error?: unknown
      }

      error.message =
        typeof payload.message === "string"
          ? payload.message
          : typeof payload.detail === "string"
            ? payload.detail
            : typeof payload.error === "string"
              ? payload.error
              : fallback
    } else if (typeof data === "string" && data.length > 0) {
      error.message = data
    }

    return error
  },
]
```

Recommended UI catch shape:

```ts
import { getErrorMessage } from "@/lib/error"

try {
  await update.mutateAsync(payload)
} catch (error) {
  toast.error(getErrorMessage(error, "Failed to update item"))
}
```

Feature functions may still catch specific domain cases:

```ts
try {
  return await fetchTeamById(teamId)
} catch (error) {
  if (isHTTPError(error) && error.response.status === 404) {
    throw notFound()
  }

  throw error
}
```

This split keeps responsibilities clear:

- Ky normalizes transport/API error messages.
- Feature functions map known domain states.
- TanStack Query receives thrown errors.
- UI mutation flows use `getErrorMessage(error, fallback)`.
- Error boundaries and local query states decide what the user sees for query failures.

## 12. Remaining Watch Areas

Keep reviewing these areas in future work:

- Repeated local loading/error/empty UI in optional widgets.
- Any new `useSuspenseQuery` added without matching route `ensureQueryData`.
- Any new feature barrel that accidentally exports server-only code.
- Any mutation hook that starts owning toast, dialog state, or navigation.
- Any new UI/API catch that ignores `getErrorMessage(error, fallback)`.

## 13. Verification

After server-state refactors, run:

```bash
pnpm typecheck
pnpx @biomejs/biome check --write
pnpm build
```

For documentation-only updates, `typecheck` and `build` are optional.
