---
trigger: always_on
---

# TanStack Query, Start, and Router Data Rules

These rules are mandatory for all server-state code in Agentick-FE.

## 1. Approved Data Stack

- Use TanStack Query for server-state caching, mutations, invalidation, retries, loading, and error state.
- Use TanStack Router loaders for route-level orchestration and prefetching.
- Use TanStack Start `createServerFn` for server-only operations callable from client code.
- Use Ky through `src/lib/ky.ts` for backend HTTP calls.
- Do not introduce parallel server-state systems or feature-local ad hoc fetch caches.

## 2. Feature Data Layer Shape

Each feature should keep this boundary:

```text
src/features/[feature]/
├── server.ts     # server-only API/database logic
├── functions.ts  # createServerFn wrappers
├── queries.ts    # query keys, queryOptions, mutations
├── schemas.ts    # Zod schemas and exported types
└── index.ts      # client-safe public API
```

Rules:
- `server.ts` must import `"@tanstack/react-start/server-only"`.
- `server.ts` must never be exported from `index.ts`.
- `functions.ts` may import `server.ts` and may be imported from routes/components.
- `queries.ts` should import server functions from `functions.ts`, not `server.ts`.

## 3. Query Function Error Contract

A query function must either:
- resolve valid data, or
- throw/reject an error.

Forbidden:

```ts
try {
  return await api.get(...).json()
} catch (error) {
  console.error(error)
  return null
}
```

Required:

```ts
const response = await api.get(...).json<TBaseResponse<TData>>()
return response.data
```

Ky already throws `HTTPError` for non-2xx responses. Let that error reach TanStack Query. Only catch an error when the catch block converts a deliberate domain case, such as a known `404`, into `notFound()` or a documented typed result. All other errors must be rethrown.

## 4. Query Keys and Query Options

Each feature must define a key factory:

```ts
export const projectKeys = {
  all: ["projects"] as const,
  lists: () => [...projectKeys.all, "list"] as const,
  list: (params: TGetProjectsInput) => [...projectKeys.lists(), params] as const,
  details: () => [...projectKeys.all, "detail"] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
}
```

Each query should be exported as `queryOptions`:

```ts
export const projectQueryOptions = (projectId: string) =>
  queryOptions({
    queryKey: projectKeys.detail(projectId),
    queryFn: () => getProjectByIdFn({ data: { projectId } }),
  })
```

Do not export custom `useXQuery()` hooks unless they add real reusable behavior beyond `useQuery(queryOptions)`.

## 5. Route Loader Policy

Use route loaders as orchestration points:

```ts
loader: async ({ context, params }) => {
  await context.queryClient.ensureQueryData(projectQueryOptions(params.projectId))
  void context.queryClient.prefetchQuery(projectStatsQueryOptions(params.projectId))
}
```

- Use `ensureQueryData` for data required to render the route.
- Use `prefetchQuery` for secondary widgets that should not block route rendering.
- Consume critical prefetched data with `useSuspenseQuery` or `useSuspenseQueries`.
- Use `useQuery` for optional widgets, background widgets, or UI that needs local loading/error display.
- Keep cross-feature composition in `src/routes`, not inside feature components.
- Do not pair `prefetchQuery` with `useSuspenseQuery` for the same data unless the route also guarantees the data with `ensureQueryData`.
- Add route-level or layout-level `errorComponent` boundaries for important nested app areas, such as dashboard sections, project layouts, team layouts, inbox, and schedules.

## 6. Suspense and Error UI

- Suspense queries rely on route loaders and Error Boundaries for loading/error behavior.
- `useSuspenseQuery` must not be used for conditionally enabled queries.
- Query options used by `ensureQueryData` + Suspense should not include `enabled`; the route params are the precondition.
- `enabled` belongs on optional/search/inline component-local `useQuery` calls.
- Optional `useQuery` widgets must render loading, error, and empty states consistently using standard components:
  - **Loading:** Use `<Skeleton>` (hardcoded layout mapping expected shape).
  - **Error:** Use `<Alert variant="destructive">` with `getErrorMessage(error)`.
  - **Empty:** Use full `<Empty>` composition for real empty data.
- **Compact Exceptions:** In confined layouts like Sidebars, replace full components with small inline skeletons and tiny icon/text rows.
- Do not hide failed queries by defaulting to empty arrays unless the server returned a valid empty result.
- Missing critical route resources should catch only known `HTTPError` 404 cases and throw `notFound()`. Unknown API errors must propagate to the nearest error boundary.

## 7. Mutation Policy

Mutation hooks should own cache correctness:

```ts
const update = useMutation({
  mutationFn: updateProjectFn,
  onSuccess: async (_, variables) => {
    await queryClient.invalidateQueries({
      queryKey: projectKeys.detail(variables.projectId),
    })
  },
})
```

Rules:
- Shared mutation hooks handle invalidation, optimistic updates, rollback, and cache writes.
- Components handle toast messages, dialog state, navigation, and local UI status.
- Avoid `toast` and `router.navigate` inside shared mutation hooks.
- Use `mutateAsync` only when composing follow-up side effects in the component.
- Await invalidation when the mutation should remain pending until related cache updates are complete.

## 8. QueryClient Lifecycle

- Do not use a module-level QueryClient singleton for SSR user data.
- Create the QueryClient through a factory and pass the same instance to Router context and `QueryClientProvider`.
- Auth flows must clear the active QueryClient from context, not an unrelated imported singleton.

## 9. Ky Error Normalization

- Keep auth headers, refresh handling, redirects, and API error message normalization in `src/lib/ky.ts`.
- Keep Ky v2 API root configuration on `prefix` in this project. Do not use `prefixUrl`.
- Use Ky v2 `beforeError` to convert backend error payloads into a stable `error.message`; the hook receives a state object such as `({ error })`, not the error directly.
- In Ky v2, prefer `HTTPError.data` for parsed response payloads. Do not call `error.response.json()` in `beforeError` because Ky consumes the body while populating `error.data`.
- Ky must continue throwing `HTTPError` for non-2xx responses; normalization must not convert failures into success data.
- Do not repeatedly clone/read `error.response` in feature server functions for generic messages.
- Feature `functions.ts` may still catch specific domain cases, such as `HTTPError` 404 -> `notFound()`, and must rethrow everything else.
- Components and mutation callbacks should use `getErrorMessage(error, fallback)` from `src/lib/error.ts` for user-facing failure copy instead of parsing backend payloads locally.
