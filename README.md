# Agentick - AI-Powered Project Management

Agentick is a modern project management platform that proactively detects deadline risks and improves estimation accuracy using AI agents and execution behavior data.

## 🚀 Welcome to the Development Team!

This guide is for developers joining the project to ensure consistency, quality, and smooth collaboration.

---

## 🏗️ 1. Introduction

Agentick is an AI Agent-powered project management platform that proactively detects deadline risks and improves deadline estimation over time using accumulated execution behavior data.

The platform leverages advanced AI agents to analyze historical execution patterns, providing teams with predictive insights that traditional project management tools lack.

## ⚙️ 2. Installation & Setup

If you are starting from scratch (no dev tools installed), follow Step 0. Otherwise, skip to Step 1.

### 0. Prerequisites & Environment Setup

You need to install these tools to run the frontend project:

1. **Git**: To download the source code.
   - [Download for Windows/Mac/Linux](https://git-scm.com/downloads)
   - Verify: Open your terminal and run `git --version`

2. **Node.js (LTS Version)**: The runtime for React apps.
   - [Download Node.js](https://nodejs.org/en/download/) (Pick the **LTS** version)
   - Restart terminal and verify: `node --version`

3. **PNPM**: Our fast and efficient package manager.
   - After installing Node.js, run this command in your terminal:
     ```bash
     npm install -g pnpm
     ```
   - Verify: `pnpm --version`

---

### 1. Clone the Repository
Open your terminal (PowerShell, CMD, or Terminal) and run:
```bash
git clone https://github.com/daFoggo/Agentick-FE.git
cd Agentick-FE
```

### 2. Setup Environment Variables
Create a `.env` file in the project root and configure the backend API endpoints.
```env
# Client Side API Configuration (Mandatory)
VITE_API_CORE_URL=http://localhost:8000
VITE_API_AI_URL=http://localhost:8001
VITE_APP_NAME="Agentick"

# Server Side (Leave empty for default local flow unless needed)
DATABASE_URL=
OPEN_AI_API_KEY=
SELINE_TOKEN=
```
*(If backend runs on a different port, update the URLs accordingly.)*

### 3. Install Dependencies
Run this command to install all project packages:
```bash
pnpm install
```

### 4. Start the Development Server
```bash
pnpm dev
```
**Result:** The application should now be running locally at the port displayed in your terminal (usually `http://localhost:3000`).


## 📁 3. Project Structure

The project follows a **Feature-Based Architecture**. This approach keeps domestic logic encapsulated and makes the codebase easier to navigate as it scales.

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
│   │   ├── index.ts     # Public API (Export point)
│   │   └── server.ts    # Server-side logic (TanStack Start)
│   └── ...
├── hooks/               # Global React hooks
├── lib/                 # Third-party library initializations (Axios, etc.)
├── routes/              # TanStack Router route definitions (Orchestration Layer)
├── stores/              # Global state management (Zustand)
└── types/               # Global TypeScript definitions
```

## 🛠️ 4. Development Patterns

### 🧩 4.1 Orchestration Pattern (Route-Level Composition)

When a page requires data or UI from multiple features (e.g., a Dashboard showing profile, tasks, and projects), **do not** write all that code inside a single feature.

- **Features** provide "Widgets" (e.g., `MyTasksList`, `ProfileCard`).
- **Routes** act as the **Orchestrator**: They import components from various features and arrange them into a layout.
- **Rule**: If Feature A needs to display data from Feature B, the composition happens in `src/routes/`, not inside `src/features/A/`.

### ⚡ 4.2 Data Fetching Strategy (Prefetching)

To ensure a smooth, zero-latency user experience, use the **Loader Prefetching** pattern:

1. **Define Query Options**: In your feature's `queries.ts`, export query options using TanStack Query.
2. **Prefetch in Loader**: In the corresponding `route.tsx`, use `context.queryClient.ensureQueryData()` inside the `loader` function.
3. **Consume in Component**: Use `useQuery` or `useSuspenseQuery` inside your component. Since the data is already in the cache from the loader, it will render instantly without a loading spinner.

> [!TIP]
> This pattern prevents "Waterfall" loading where components fetch data sequentially after they mount.

### ⚖️ 4.3 Scoping: Global vs. Feature

Maintaining a clean separation between global and feature-specific code is crucial for maintainability.

| Scope | When to use? | Real Examples |
| :--- | :--- | :--- |
| **Feature** | Code that belongs to a specific business domain (Auth, Project, Team). | `ProjectSettings`, `authSchema`, `getTaskPrioritiesFn` |
| **Common / Global** | Reusable logic used across 2+ features or core system entities. | `RoleBadge`, `DataTable`, `MarkdownRenderer` |
| **Layout** | Core structural components shared across the entire application shell. | `ViewModeList`, `Sidebar`, `AppHeader` |

#### Comparison Example:
- **Feature Component**: `src/features/projects/components/project-settings.tsx` - This component is tightly coupled with the Project entity and its update logic.
- **Common Component**: `src/components/common/role-badge.tsx` - While it handles user roles, it is used across Teams, Projects, and User profiles, making it a "Common" utility.
- **Layout Component**: `src/components/layout/app/user-profile.tsx` - This is a structural part of the dashboard that handles user context globally.

### Creating a New Feature

When building a new feature (e.g., "Teams"), follow this standard structure:

1. **Initialize Directory**: Create `src/features/teams/`.
2. **Define Schema** (`schemas.ts` or `schemas/`): Use Zod to define data models and form validation.
3. **API Logic** (`functions.ts` or `functions/`): Define API interaction functions.
4. **Hooks** (`queries.ts` or `queries/`): Create TanStack Query hooks for caching and state management.
5. **UI Components** (`components/`): Build feature-specific views (Widgets).
6. **Server Actions** (`server.ts` or `server/`): Define server-side functions.
7. **Export** (`index.ts`): Use a barrel file to export the public API.

> [!NOTE]
> For complex features with many sub-entities (e.g., `task-config`), it is recommended to use subdirectories (e.g., `queries/task-status.ts`) and a barrel file within each subdirectory to keep the feature manageable.

#### Export/Import Pattern
To keep the internal structure of a feature private, always use the `index.ts` file as the entry point.

**Wrong (Direct access):**
```typescript
import { teamSchema } from "@/features/teams/schemas";
```

**Correct (Via Barrel File):**
```typescript
import { teamSchema } from "@/features/teams";
```

> [!CAUTION]
> **Server-Only Code Protection**: Never export `server.ts` or `servers/` from your feature's `index.ts` barrel file.
> 
> In TanStack Start, logic marked with `"@tanstack/react-start/server-only"` is strictly prohibited in the client bundle. Re-exporting these files from the main feature entry point will cause Vite to bundle them when the client imports types or components, leading to build warnings or errors.
> 
> **Correct way**: Keep `server.ts` private to the feature and only access its logic via `createServerFn` (defined in `functions.ts`), or import it directly only in server-side files.


## 🛡️ 5. Quality Assurance (Pre-commit)

To maintain codebase stability, every developer **must** ensure that the project builds successfully, passes all linter checks, and passes all type checks before committing code.

### Required Checks & Commands:
1. **Linter, Formatter & Import Organizer (Biome)**: 
   ```bash
   pnpx @biomejs/biome check --write
   ```
   *Must be run to automatically format, clean, lint, and organize imports for all files.*

2. **Type Check**: 
   ```bash
   pnpm typecheck
   ```
   *Runs `tsc --noEmit` to guarantee all TypeScript types are fully valid.*

3. **Production Build**: 
   ```bash
   pnpm build
   ```
   *Ensures the project compiles cleanly and can be deployed without any build errors.*

> [!IMPORTANT]
> Any commit that breaks the build, contains TypeScript errors, or violates Biome linting rules is strictly prohibited from being pushed to the repository. Please run these checks before every commit to ensure the highest code quality standards.

## 📚 6. Recommended Documentation

To effectively contribute to the project, familiarize yourself with our core tech stack:

- [TanStack Start](https://tanstack.com/start) - Full-stack framework
- [TanStack Router](https://tanstack.com/router) - Type-safe routing
- [TanStack Query](https://tanstack.com/query) - State & Data fetching
- [TanStack Form](https://tanstack.com/form) - Type-safe form management
- [TanStack Table](https://tanstack.com/table) - Headless table logic
- [Zod](https://zod.dev) - Schema validation
- [Shadcn UI](https://ui.shadcn.com) - UI component system

