# TanStack Query Standardization Progress

This file tracks the cleanup work needed to align Agentick-FE with the data patterns in `docs/06_frontend_data_patterns.md`.

See `docs/09_refactor_knowledge_transfer.md` for architectural decisions, route criticality rules, Suspense/local query state guidance, and specific lessons learned during the refactor sessions.

Status legend:

- `[ ]` Not started
- `[~]` Partially done
- `[x]` Done
- `[!]` Needs design decision

## Current Baseline

- `[x]` Ky confirmed to throw `HTTPError` for non-2xx responses by default.
- `[x]` `ky` updated from `2.0.0` to `2.0.2`.
- `[x]` Removed unused `@tanstack/zod-form-adapter` dependency because it only supports `zod@^3.x` and the project uses Zod 4.
- `[x]` Most features already have `functions.ts`, `server.ts`, and `queries.ts`.
- `[x]` Critical route/Suspense paths use `ensureQueryData`; secondary widgets use `prefetchQuery` or local `useQuery` state.
- `[x]` `QueryClient` lifecycle reviewed and refactored away from a module-level user-data singleton.
- `[x]` Ky/API error normalization is centralized in `src/lib/ky.ts`; UI failure copy uses normalized `error.message` via `getErrorMessage`.

## Phase 1 - Query Function Error Contract

Goal: remove all `catch -> return null` patterns from server fetchers unless there is a documented domain reason.

Files to inspect:

- `[x]` `src/features/projects/server.ts`
- `[x]` `src/features/teams/server.ts`
- `[x]` `src/features/tasks/server.ts`
- `[x]` `src/features/phases/server.ts`
- `[x]` `src/features/task-config/servers/task-status.ts`
- `[x]` `src/features/task-config/servers/task-priority.ts`
- `[x]` `src/features/task-config/servers/task-type.ts`
- `[x]` `src/features/task-config/servers/task-tag.ts`

Expected result:

- Detail fetchers return `Promise<T>` when missing data is exceptional.
- Known missing-resource cases throw `notFound()` or a documented typed domain result.
- No generic `console.error(error); return null`.

## Phase 2 - Central Ky Error Normalization

Goal: normalize backend error payloads in one place.

Files to inspect:

- `[x]` `src/lib/ky.ts`
- `[x]` `src/lib/error.ts`
- `[x]` `src/features/events/server.ts`
- `[x]` Any `server.ts` file that clones or reads `error.response`
- `[x]` Mutation/UI catch paths that previously showed generic hardcoded API failure copy

Expected result:

- `src/lib/ky.ts` handles common API error message normalization with Ky hooks.
- UI components and mutation callbacks use `getErrorMessage(error, fallback)` instead of parsing backend payloads locally.
- Feature server functions no longer manually clone/read error response bodies for generic error messages.
- Domain-specific catches rethrow unknown errors.

Notes:

- This phase is about message normalization only, not changing the query error contract.
- Ky should still throw for non-2xx responses.
- Feature code may still catch known domain cases such as `HTTPError` 404 -> `notFound()`.
- The project uses Ky v2 `prefix` for API roots; do not use `prefixUrl`.

## Phase 3 - QueryClient Lifecycle

Goal: ensure QueryClient cache is not shared across SSR requests/users.

Files to inspect:

- `[x]` `src/lib/query-client.ts`
- `[x]` `src/router.tsx`
- `[x]` `src/components/common/query-provider.tsx`
- `[x]` `src/features/auth/components/signin-form.tsx`
- `[x]` `src/components/layout/app/sidebar/user-profile.tsx`

Expected result:

- `createQueryClient()` is the default creation path.
- Router context and `QueryClientProvider` receive the same active QueryClient instance.
- Components use `useQueryClient()` instead of importing a global singleton.
- Sign-in/sign-out clears the active QueryClient.

## Phase 4 - Query Key Factory Cleanup

Goal: standardize query keys and invalidation scopes.

Files to inspect:

- `[x]` `src/features/projects/queries.ts`
- `[x]` `src/features/tasks/queries.ts`
- `[x]` `src/features/teams/queries.ts`
- `[x]` `src/features/users/queries.ts`
- `[x]` `src/features/invitations/queries.ts`
- `[x]` `src/features/inbox/queries.ts`
- `[x]` `src/features/agent/queries.ts`
- `[x]` `src/features/events/queries.ts`
- `[x]` `src/features/project-members/queries.ts`
- `[x]` `src/features/team-members/queries.ts`
- `[x]` `src/features/phases/queries.ts`
- `[x]` `src/features/schedules/queries.ts`
- `[x]` `src/features/task-config/queries/*`

Expected result:

- Each feature has `[feature]Keys`.
- Query options use key factories only.
- Invalidation uses feature key prefixes, not duplicated hardcoded arrays.

## Phase 5 - Route Loader and Suspense Alignment

Goal: critical route data is loaded at route level and consumed consistently.

Already good examples:

- `[x]` `src/routes/dashboard/$teamId/projects/$projectId/route.tsx`
- `[x]` `src/routes/dashboard/$teamId/projects/$projectId/tasks.$taskId.tsx`
- `[x]` `src/routes/dashboard/$teamId/inbox/*`

Files/routes to review:

- `[x]` `src/routes/dashboard/$teamId/schedules/index.tsx`
- `[x]` `src/routes/dashboard/$teamId/overview/index.tsx`
- `[x]` `src/routes/dashboard/$teamId/projects/$projectId/board.tsx`
- `[x]` `src/routes/invite/accept.tsx`
- `[x]` Sidebar/layout queries under `src/components/layout/app`

Expected result:

- Required data uses `ensureQueryData` and `useSuspenseQuery`.
- Secondary widgets use `prefetchQuery` and local states.
- No duplicate fetch pattern for data already guaranteed by route loader.

## Phase 6 - Mutation Side-Effect Separation

Goal: shared mutation hooks manage cache; components manage UX.

Files to inspect:

- `[x]` `src/features/invitations/queries.ts`
- `[x]` `src/features/invitations/components/accept-invite-card.tsx`
- `[x]` `src/features/auth/components/signin-form.tsx`
- `[x]` `src/features/auth/components/signup-form.tsx`
- `[x]` `src/features/teams/components/create-team-dialog.tsx`
- `[x]` `src/features/projects/components/create-project-dialog.tsx`
- `[x]` `src/features/task-config/components/**`
- `[x]` `src/features/tasks/components/**`
- `[x]` `src/features/project-members/components/**`
- `[x]` `src/features/team-members/components/**`
- `[x]` `src/features/events/components/**`
- `[x]` `src/features/schedules/components/**`

Expected result:

- Mutation hooks do not toast or navigate unless explicitly feature-private.
- Components call `mutateAsync` when they need local follow-up effects.
- Duplicate success/error toasts are removed.
- User-facing mutation errors are derived from normalized `error.message` through `getErrorMessage`.

## Phase 7 - Local Query State Components

Goal: reduce repeated loading/error/empty blocks for optional `useQuery` widgets.

Files/components to inspect:

- `[x]` `src/features/team-members/components/team-member-list.tsx`
- `[x]` `src/features/project-members/components/project-member-list.tsx`
- `[x]` `src/features/task-config/components/task-status/task-status-list.tsx`
- `[x]` `src/features/task-config/components/task-priority/task-priority-list.tsx`
- `[x]` `src/features/task-config/components/task-type/task-type-list.tsx`
- `[x]` `src/features/task-config/components/task-tag/task-tag-list.tsx`

Expected result:

- Loading state uses shared skeleton/spinner pattern.
- Error state is consistent and not confused with empty data.
- Empty state uses the project's `<Empty>` composition.

## Verification Checklist

Run after each cleanup phase that changes code:

```bash
pnpm typecheck
pnpx @biomejs/biome check --write
pnpm build
```

For documentation-only updates, typecheck/build are optional unless package or code files changed.

Last full Ky/error pass verification:

- `pnpx @biomejs/biome check --write ...`
- `pnpm typecheck`
- `pnpm build`
