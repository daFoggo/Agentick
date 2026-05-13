---
trigger: always_on
---

# TanStack Query, Start, Router, and Ky Rules

Use these rules together with `docs/handbook/04_tanstack_start_query_router.md`.

## Approved Stack

- TanStack Start for app/server-function integration.
- TanStack Router for routing, loaders, route context, errors, and not-found handling.
- TanStack Query for server-state caching and mutations.
- Ky v2 for HTTP calls.
- Zod for validation.

## Query Contract

- Query functions must resolve valid data or throw.
- Do not return `null`, `[]`, `{ error }`, or fallback objects for API failures.
- Ky throws `HTTPError` for non-2xx responses. Let it propagate unless converting a deliberate known case.
- Known missing critical route resources may become `notFound()`.
- Unknown errors must rethrow.

## Query Options

- Each feature owns query key factories.
- Export `queryOptions` factories.
- Use the same options in loaders, components, and cache APIs.
- Invalidate with key factory prefixes.

## Route Criticality

- Critical route data: `ensureQueryData` + `useSuspenseQuery` / `useSuspenseQueries`.
- Secondary widget data: `prefetchQuery` or local `useQuery` with local states.
- Optional/search/inline queries may use `enabled`.
- Suspense query options should not use `enabled`.
- Do not use Suspense for data that was only fire-and-forget prefetched.

## Mutations

- Shared mutation hooks own invalidation, optimistic updates, rollback, and cache writes.
- Components own toast, dialog state, navigation, local status, and form reset.
- Avoid `toast` and `router.navigate` in shared mutation hooks.
- Await invalidation when pending state should include cache refresh.

## QueryClient Lifecycle

- Do not use a module-level `QueryClient` singleton for user data.
- Create QueryClient through `createQueryClient()`.
- Create it in the router/request lifecycle.
- Pass the same instance to router context and `QueryProvider`.
- Clear the active `useQueryClient()` instance on auth changes.

## Ky v2

- Keep HTTP setup in `src/lib/ky.ts`.
- Keep API roots on `prefix`; do not introduce `prefixUrl`.
- Use `beforeError` to normalize generic backend messages.
- Use `HTTPError.data` in `beforeError`.
- Do not call `error.response.json()` in `beforeError`.
- UI and mutation catch blocks use `getErrorMessage(error, fallback)`.
