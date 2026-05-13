# Frontend Data Fetching and Mutation Patterns

This document defines the standard Agentick-FE pattern for TanStack Query, TanStack Router, TanStack Start server functions, and Ky.

## 1. Goals

- Server-state code should be predictable, typed, and cache-aware.
- Route pages should avoid component-level request waterfalls.
- Query and mutation failures should propagate through TanStack Query instead of being hidden as fake data.
- Shared feature logic should stay reusable and free of UI-specific side effects.

## 2. Source References

- TanStack Query query functions: query functions must resolve data or throw/reject an error.
- TanStack Query query options: use `queryOptions` to share `queryKey` and `queryFn`.
- TanStack Query mutations: invalidate related queries in mutation callbacks.
- TanStack Router data loading: route loaders should orchestrate required data and external caches.
- TanStack Start server functions: server functions can throw errors, redirects, and not-found responses.
- Ky: non-2xx responses throw `HTTPError` by default when `throwHttpErrors` is enabled.

## 3. Feature Layer Contract

Use this structure for feature server-state code:

```text
src/features/[feature]/
├── server.ts
├── functions.ts
├── queries.ts
├── schemas.ts
└── index.ts
```

Responsibilities:

| File | Responsibility | Import rules |
|---|---|---|
| `server.ts` | Server-only backend calls, database calls, and domain IO | Must import `"@tanstack/react-start/server-only"`; never export from feature barrel |
| `functions.ts` | `createServerFn` wrappers, input validation, RPC boundary | Safe to import from routes/components |
| `queries.ts` | Query key factories, `queryOptions`, mutation hooks/options | Import from `functions.ts`, not `server.ts` |
| `schemas.ts` | Zod schemas and types | Safe to import from client and server |
| `index.ts` | Feature public API | Export client-safe modules only |

## 4. Query Function Contract

Every query function must either resolve valid data or throw.

Do not convert infrastructure failures into valid data:

```ts
// Wrong
export async function fetchProjectById(projectId: string): Promise<TProject | null> {
  try {
    const response = await api.get(`projects/${projectId}`).json<TBaseResponse<TProject>>()
    return response.data
  } catch (error) {
    console.error(error)
    return null
  }
}
```

Use this pattern:

```ts
// Correct
export async function fetchProjectById(projectId: string): Promise<TProject> {
  const response = await api.get(`projects/${projectId}`).json<TBaseResponse<TProject>>()
  return response.data
}
```

If `404` is a valid route-level missing-resource case, convert it deliberately:

```ts
import { notFound } from "@tanstack/react-router"
import { isHTTPError } from "ky"

export async function fetchProjectById(projectId: string): Promise<TProject> {
  try {
    const response = await api.get(`projects/${projectId}`).json<TBaseResponse<TProject>>()
    return response.data
  } catch (error) {
    if (isHTTPError(error) && error.response.status === 404) {
      throw notFound()
    }

    throw error
  }
}
```

Only catch errors when converting a specific known domain case. Do not log-and-swallow.

## 5. Query Keys and Query Options

Each feature should define a query key factory:

```ts
export const projectKeys = {
  all: ["projects"] as const,
  lists: () => [...projectKeys.all, "list"] as const,
  list: (params: TGetProjectsInput) => [...projectKeys.lists(), params] as const,
  details: () => [...projectKeys.all, "detail"] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
}
```

Each query should be exported as a query options factory:

```ts
export const projectQueryOptions = (projectId: string) =>
  queryOptions({
    queryKey: projectKeys.detail(projectId),
    queryFn: () => getProjectByIdFn({ data: { projectId } }),
  })
```

Use the same options everywhere:

```ts
await context.queryClient.ensureQueryData(projectQueryOptions(projectId))
void context.queryClient.prefetchQuery(projectQueryOptions(projectId))
const { data } = useSuspenseQuery(projectQueryOptions(projectId))
queryClient.invalidateQueries({ queryKey: projectKeys.details() })
```

Preconditions belong at the call-site level:

- Required route query options should not include `enabled`; route params and loaders are the precondition.
- Optional, search, and inline component queries may use `enabled`.
- If the same query can be used in both modes, prefer two explicit option factories instead of one ambiguous factory.

## 6. Route Loader Policy

Routes are orchestration boundaries. Features expose query options and widgets; routes decide what is required for the page.

```ts
export const Route = createFileRoute("/dashboard/$teamId/projects/$projectId")({
  loader: async ({ context, params }) => {
    const project = await context.queryClient.ensureQueryData(
      projectQueryOptions(params.projectId),
    )

    void context.queryClient.prefetchQuery(projectStatsQueryOptions(params.projectId))

    return project
  },
})
```

Use:

| Case | Loader API | Component API |
|---|---|---|
| Required route data | `ensureQueryData` | `useSuspenseQuery` / `useSuspenseQueries` |
| Secondary widget data | `prefetchQuery` | `useQuery` with local loading/error/empty state |
| Optional/conditional data | Usually no blocking loader | `useQuery` with `enabled` |
| Cross-feature page composition | Route loader/component | Not inside feature A importing feature B |

Do not pair `prefetchQuery` with `useSuspenseQuery` for the same data unless another loader path also guarantees that data with `ensureQueryData`.

## 7. Loading, Error, and Empty States

Use one of two modes:

1. Suspense mode for required route data:
   - route loader preloads with `ensureQueryData`
   - component uses `useSuspenseQuery`
   - route/application Error Boundary handles errors

2. Local state mode for optional widgets:
   - component uses `useQuery`
   - component renders loading, error, and empty states
   - empty state is only for valid empty data, not failed fetches

Do not default failed query data to `[]` or `null` to hide errors.

Important nested app routes should define an `errorComponent` so a failed section does not replace the whole app shell. Use `notFound()` for known missing route resources, and let unknown API errors reach the nearest error boundary.

## 8. Mutation Policy

Shared mutation hooks should only own server-state correctness:

```ts
export const useProjectMutations = () => {
  const queryClient = useQueryClient()

  const update = useMutation({
    mutationFn: (data: { projectId: string; payload: TUpdateProjectInput }) =>
      updateProjectFn({ data }),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: projectKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: projectKeys.detail(variables.projectId) }),
      ])
    },
  })

  return { update }
}
```

Component code owns UI side effects:

```ts
try {
  await update.mutateAsync({ projectId, payload })
  toast.success("Saved successfully")
  setOpen(false)
} catch {
  toast.error("Failed to save")
}
```

Rules:

- Put invalidation, optimistic updates, rollback, and cache writes in mutation hooks.
- Put toast, dialog state, local status, and navigation in components.
- Avoid shared hooks that navigate or toast implicitly.
- Use `mutateAsync` for composed side effects; otherwise prefer `mutate`.
- Await invalidation in `onSuccess` when pending state should continue until cache updates finish.

## 9. QueryClient Lifecycle

For SSR/TanStack Start, avoid request-shared user-data caches.

Rules:

- Create QueryClient through `createQueryClient()`.
- Pass the same QueryClient instance to Router context and `QueryClientProvider`.
- Do not import a module-level singleton into components for auth clearing or mutation side effects.
- Auth sign-in/sign-out should clear the active QueryClient instance from context.

## 10. Ky Error Normalization

Ky already throws `HTTPError` for non-2xx responses. Central Ky normalization should make those thrown errors easier to display and debug; it must not turn failures into valid data.

Keep cross-cutting HTTP behavior in `src/lib/ky.ts`:

- auth header injection
- refresh-token retry
- auth redirect on unrecoverable 401
- backend error payload to readable `error.message`
- stable fallback messages for malformed or unknown backend error shapes

Use Ky v2 `beforeError` for generic backend error payload normalization. The hook receives a state object, and `HTTPError.data` is already populated before `beforeError` runs. The goal is that feature code, components, and mutation callbacks can rely on `error.message` without cloning and parsing the response body repeatedly.

Current project shape:

```ts
import ky, { isHTTPError } from "ky"

export const api = ky.create({
  prefix: API_ENDPOINTS.CORE_API_URL,
  hooks: {
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
    ],
  },
})
```

UI code should use the shared helper instead of reading backend payloads directly:

```ts
import { getErrorMessage } from "@/lib/error"

try {
  await mutation.mutateAsync(payload)
} catch (error) {
  toast.error(getErrorMessage(error, "Failed to save changes"))
}
```

Feature code should catch only known domain cases and rethrow everything else:

```ts
try {
  return await fetchProjectById(projectId)
} catch (error) {
  if (isHTTPError(error) && error.response.status === 404) {
    throw notFound()
  }

  throw error
}
```

Do not use feature-specific catches just to create generic messages. That belongs in Ky. Do not normalize by returning `{ error }`, `null`, or an empty collection; TanStack Query must still receive a thrown error. Do not use `prefixUrl`; this project uses Ky v2 `prefix` for API roots.
