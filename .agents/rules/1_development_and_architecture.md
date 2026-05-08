---
trigger: always_on
---

# 🏗️ Development & Architecture Guide

This guide outlines the core development patterns, directory architecture, and code composition standards for the **Agentick Frontend** codebase. All AI agents and developers must strictly adhere to these patterns.

---

## 1. Directory Structure & Feature-Based Architecture

The project follows a modular **Feature-Based Architecture**. This approach encapsulates domain-specific logic, schemas, and UI elements into self-contained directories under `src/features/`.

```text
src/
├── components/          # Global UI components (Shadcn, Base UI)
├── configs/             # Global configurations (API, Auth)
├── constants/           # Shared constants (Enums, static data)
├── features/            # Business logic divided by feature (Core)
│   ├── auth/            # Authentication feature
│   ├── projects/        # Project management feature
│   │   ├── components/  # Feature-specific UI
│   │   ├── functions.ts # API calls / helper logic
│   │   ├── queries.ts   # TanStack Query hooks
│   │   ├── schemas.ts   # Zod validation schemas
│   │   ├── index.ts     # Public API (Export point / Barrel file)
│   │   └── server.ts    # Server-side logic (TanStack Start)
│   └── ...
├── hooks/               # Global React hooks
├── lib/                 # Third-party library initializations (Axios, etc.)
├── routes/              # TanStack Router route definitions (Orchestration Layer)
├── stores/              # Global state management (Zustand)
└── types/               # Global TypeScript definitions
```

### 📦 1.1 Barrel Export/Import Pattern (Private by Default)
To keep the internal structure of a feature private and maintain clean imports, **always use the `index.ts` file as the entry point**.

* **Wrong (Direct access):**
  ```typescript
  import { teamSchema } from "@/features/teams/schemas";
  ```
* **Correct (Via Barrel File):**
  ```typescript
  import { teamSchema } from "@/features/teams";
  ```

> [!CAUTION]
> **Server-Only Code Protection**: Never export `server.ts` or files marked with `"@tanstack/react-start/server-only"` inside the feature's `index.ts` barrel file. Re-exporting these will cause Vite to bundle server code into the client, resulting in build failures. Access them only via `createServerFn` or direct server imports.

---

## 2. Orchestration Pattern (Route-Level Composition)

When a page requires data or UI components from multiple features (e.g., a Dashboard showing profile, tasks, and projects), **do not write feature-coupling code inside a single feature**.

* **Features** provide "Widgets" (e.g., `MyTasksList`, `ProfileCard`).
* **Routes** (`src/routes/`) act as the **Orchestrator**: They import components from various features and arrange them into the final page layout.
* **Rule**: If Feature A needs to display data from Feature B, the composition happens in `src/routes/`, never inside `src/features/A/`.

---

## 3. Data Fetching Strategy (Loader Prefetching)

To ensure a smooth, zero-latency user experience, use the **Loader Prefetching** pattern with TanStack Query and TanStack Router:

1. **Define Query Options**: In your feature's `queries.ts`, export query options using TanStack Query's `queryOptions`.
2. **Prefetch in Loader**: In the corresponding `route.tsx`, use `context.queryClient.ensureQueryData()` inside the route's `loader` function.
3. **Consume in Component**: Use `useQuery` or `useSuspenseQuery` inside your component. Since the data is already preloaded in the cache, it will render instantly without showing empty states or loading spinners.

---

## 4. Scoping: Global vs. Feature

| Scope | When to use? | Real Examples |
| :--- | :--- | :--- |
| **Feature** | Code that belongs to a specific business domain. | `ProjectSettings`, `authSchema`, `getTaskPrioritiesFn` |
| **Common / Global** | Reusable logic used across multiple features or core system entities. | `RoleBadge`, `DataTable`, `MarkdownRenderer` |
| **Layout** | Core structural components shared across the entire application shell. | `ViewModeList`, `Sidebar`, `AppHeader` |
