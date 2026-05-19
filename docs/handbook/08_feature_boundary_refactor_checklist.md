# Feature Boundary Refactor Checklist

This checklist tracks the migration toward stricter feature boundaries.

## Target Rule

- `src/routes` and `src/components/layout` compose data from multiple features.
- `src/features/*/components` should prefer props for cross-feature data.
- Feature components may use their own feature query/mutation hooks.
- Cross-feature imports should be limited to public barrels and should usually be types, schemas for aggregate API payloads, cache keys for invalidation, or deliberately reusable public UI.
- Avoid feature A rendering feature B's workflow component directly. Move that composition to a route/layout wrapper or expose callbacks/render props.

## Refactor Pattern

1. Find cross-feature imports in `src/features`.
2. Classify each import:
   - Keep: own-feature import, type-only aggregate, cache invalidation key, shared public schema for backend aggregate.
   - Refactor: `useQuery`, `useSuspenseQuery`, mutation hook, or UI component from another feature inside a feature component.
   - Clean: deep import from the same feature or another feature when a public barrel exists.
3. Move cross-feature data loading to the route/layout that owns the page composition.
4. Pass loaded data, loading flags, error flags, and errors through props.
5. For table columns, use column factories that receive context instead of querying inside cells.
6. Keep submit-critical loading/error handling after moving data up.
7. Run:
   - `pnpm typecheck`
   - `pnpm build`
   - `pnpx @biomejs/biome check --write`

## Completed In Current Refactor

- [x] `TeamDetailsHeader` receives team members and current user via props.
- [x] `ProjectDetailsHeader` receives project members and current user via props.
- [x] `SidebarProjectList` receives projects and permission state via props; `AppSidebar` composes the data.
- [x] `EventActionBar` receives team members, current user, and dependency states via props.
- [x] `WorkTimePattern` receives schedules/current user context via props.
- [x] `TaskLine` receives user and overview data via props.
- [x] `AcceptInviteCard` receives current user via props.
- [x] `TeamMemberList` receives members/current user via props.
- [x] `ProjectMemberList` receives members/current user via props.
- [x] Member table columns now use factory context instead of cell-level user/member queries.
- [x] Query key cross-feature imports in member queries use public feature barrels.
- [x] Route imports for inbox stats use the inbox feature barrel.

## Remaining Refactor Candidates

- [x] `TeamDetailsHeader`: remove direct rendering of `InviteTeamMemberDialog`; route/header wrapper should own dialog composition.
- [x] `ProjectDetailsHeader`: remove direct rendering of `InviteProjectMemberDialog`; route/header wrapper should own dialog composition.
- [x] `TeamSettings`: consider receiving `team` and `myTeams` from route if enforcing fully route-owned data.
- [x] `ProjectSettings`: consider receiving `project` from route if enforcing fully route-owned data.
- [x] `AcceptInviteCard`: consider receiving invitation data from route if enforcing fully route-owned data.
- [x] `MyProjectsGrid` and `MyProjectsList`: consider receiving project lists via props for route-owned page composition.
- [x] `ProjectTaskStatsCard`, `ProjectWorkload`, `ProjectStatusUpdate`: leave as optional widgets or move query state to route/page containers if they become critical page composition.
- [x] `InviteTeamMemberDialog` and `InviteProjectMemberDialog`: evaluate whether user search should stay as dialog-local optional query or become an injected search adapter.
- [x] `InboxInvitationContent`: invitation accept behavior is injected from the inbox route container.
- [x] Clean same-feature imports through feature barrels inside feature internals.

## Strict Props Mode Inventory

If the team wants every feature component to be presentational, these files still own queries and should be migrated by adding route/container wrappers:

- [x] `src/features/users/components/user-greeting.tsx`: move greeting and stats queries to dashboard overview route or a route-owned container.
- [x] `src/features/users/components/profile-card.tsx`: move current-user query to layout/user-profile wrapper.
- [x] `src/features/teams/components/my-teams-list.tsx`: move my-teams query to dashboard/team switcher composition.
- [x] `src/features/projects/components/my-projects-grid.tsx`: move my-projects query to overview route.
- [x] `src/features/projects/components/my-projects-list.tsx`: move my-projects query to projects route.
- [x] `src/features/projects/components/project-task-stats-card.tsx`: move stats query to project dashboard route or dashboard container.
- [x] `src/features/projects/components/project-workload.tsx`: move workload query to project dashboard route or dashboard container.
- [x] `src/features/projects/components/project-status-update.tsx`: move recent-status query to project dashboard route or keep as optional widget.
- [x] `src/features/agent/components/project-risk-dashboard.tsx`: move risk stats query to project dashboard route or keep as optional widget.
- [x] `src/features/project-members/components/invite-project-member-dialog.tsx`: inject user search results/search adapter instead of querying users directly.
- [x] `src/features/team-members/components/invite-team-member-dialog.tsx`: inject user search results/search adapter instead of querying users directly.
- [x] `src/features/tasks/components/task-detail-view/task-activity.tsx`: move task activity query to task detail route/container.
- [x] `src/features/task-config/components/*`: task config list/default-order queries moved to settings routes.

## Accepted Coupling

- Feature query files may import other feature key factories for cache invalidation.
- Aggregate schemas may reference related domain schemas when the backend payload is aggregate data.
- Type-only props may reference another feature's public type.
- Optional widgets may keep local queries when the widget owns loading/error/empty UI and does not compose page-level data from several features.
