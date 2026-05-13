# Agentick-FE Agent Instructions

# 🏗️ Development & Architecture Guide

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

## 2. Orchestration Pattern (Route-Level Composition)

When a page requires data or UI components from multiple features (e.g., a Dashboard showing profile, tasks, and projects), **do not write feature-coupling code inside a single feature**.

* **Features** provide "Widgets" (e.g., `MyTasksList`, `ProfileCard`).
* **Routes** (`src/routes/`) act as the **Orchestrator**: They import components from various features and arrange them into the final page layout.
* **Rule**: If Feature A needs to display data from Feature B, the composition happens in `src/routes/`, never inside `src/features/A/`.

## 3. Data Fetching Strategy (Loader Prefetching)

TanStack Router routes decide whether data is **critical** or **secondary**. Features only expose query options and widgets.

1. **Define Query Options**: In your feature's `queries.ts`, export query options using TanStack Query's `queryOptions`.
2. **Critical route data**: In `route.tsx`, use `context.queryClient.ensureQueryData()` and consume it with `useSuspenseQuery` or `useSuspenseQueries`.
3. **Secondary widget data**: Use `void context.queryClient.prefetchQuery()` or fetch locally with `useQuery`. Components must render loading, error, and empty states.
4. **Do not mix modes**: If a component uses `useSuspenseQuery`, its query must be guaranteed by the route loader. If a loader uses `prefetchQuery` because failure should not block the page, the component should use `useQuery` with local states.

## 4. Scoping: Global vs. Feature

| Scope | When to use? | Real Examples |
| :--- | :--- | :--- |
| **Feature** | Code that belongs to a specific business domain. | `ProjectSettings`, `authSchema`, `getTaskPrioritiesFn` |
| **Common / Global** | Reusable logic used across multiple features or core system entities. | `RoleBadge`, `DataTable`, `MarkdownRenderer` |
| **Layout** | Core structural components shared across the entire application shell. | `ViewModeList`, `Sidebar`, `AppHeader` |

# Agentick-FE UI Design System

## 0. AI Rules — Read First

> Strict rules; any violation is incorrect regardless of the context.

- **DO NOT** hardcode colors: `#xxx`, `bg-[#xxx]`, `rgb()`. Always use design tokens from Section 1.
- **DO NOT** hardcode custom spacing: `p-[15px]`, `mt-[22px]`. Only use the default Tailwind spacing scale.
- **DO NOT** hardcode custom font sizes: `text-[15px]`. Only use the 6 standard Tailwind levels (`xs` `sm` `base` `lg` `xl` `2xl`).
- **DO NOT** hardcode custom z-indexes: `z-[999]`. Only use the standard Tailwind z-index scale (0–50).
- **DO NOT** mix icon libraries. Only use `lucide-react`.
- **DO NOT** have 2 Primary buttons in the same viewport.
- **DO NOT** mix English and Vietnamese on the same page (except for proper names / technical terms).
- **DO NOT** animate `width / height / padding`. Only animate `transform / opacity / color`.
- **DO NOT** remove the focus ring of interactive elements.
- **DO NOT** use `<Badge>` for filters — Badges do not have interactive states.
- **DO NOT** use `react-hook-form` — the project uses `@tanstack/react-form`.
- **DO NOT** use `window.confirm()` — use `AlertDialog`.
- **DO NOT** create a new component if it already exists in `ui/` or `common/` — extend it via `className`.
- **DO NOT** use long relative import paths — only use the alias `@/*` → `src/*`.
- Every list / grid **MUST** have an empty state + loading state.
- Every icon-only button **MUST** have an `aria-label` or `<span className="sr-only">`.
- Every input **MUST** support 5 states: default, focus, error, disabled, readonly.
- Every touch target on mobile **MUST be ≥ 44×44px**.
- Every new component **MUST** have a `data-slot` on the root element.
- Every component with ≥ 2 variants **MUST** use **CVA** (class-variance-authority).
- Use `aria-invalid` for error states — do not define custom classes for errors.
- Animations **MUST** use `motion-safe:` / `motion-reduce:` to respect `prefers-reduced-motion`.
- Dark mode is class-based `.dark` — test both themes before shipping.

## 1. Foundation — Design Tokens

### Typography
| Token | Value | Used For |
|---|---|---|
| `--font-sans` | `"Google Sans Variable"` | Body, label, input |
| `--font-mono` | `"Google Sans Code Variable"` | Code |
| `--font-heading` | alias `--font-sans` | Dialog title, card title, empty title |

Font conventions for UI:
- Page heading: Font size 2xl, xl. Font weight: semibold, bold.
- Section title: Font size lg, md. Font weight: semibold, medium.
- Card, Modal, other components title: Use the default font size and font weight provided by the Shadcn component. Developers should only adjust if explicitly required.
- Body: Depending on whether it's a large or small UI section, use standard levels from text base, sm → xs. Font weight: medium → normal.
- Label: Use the default component labels. If custom styling is needed, use font sizes sm, xs and font weights: medium, normal.
- Always use standard font sizes and weights provided by Tailwind; custom values outside the scale are strictly prohibited.

### Color Tokens (OKLCH — do not hardcode colors)
- Mapped from the project's latest `styles.css`. OKLCH wrapper `oklch(...)` is omitted below for conciseness.

| Token | Light OKLCH | Dark OKLCH | Used For |
|---|---|---|---|
| `--background` | `0.99 0.004 243.72` | `0.18 0.012 243.72` | Page background |
| `--foreground` | `0.22 0.025 243.72` | `0.98 0.005 243.72` | Main text |
| `--card` / `--popover` | `1 0 0` | `0.23 0.016 243.72` | Card, dialog, popover bg |
| `--card-fore` / `--pop-fore` | `0.22 0.025 243.72` | `0.98 0.005 243.72` | Text on card, popover |
| `--primary` | `0.6984 0.1458 243.72` | `0.6984 0.1458 243.72` | Primary color (vibrant light blue) |
| `--primary-foreground` | `0.99 0.003 243.72` | `0.99 0.003 243.72` | Text on primary background |
| `--secondary` | `0.95 0.015 243.72` | `0.30 0.02 243.72` | Secondary background |
| `--secondary-foreground` | `0.35 0.08 243.72` | `0.98 0.005 243.72` | Secondary text |
| `--muted` | `0.965 0.01 243.72` | `0.27 0.018 243.72` | Soft muted background |
| `--muted-foreground` | `0.52 0.025 243.72` | `0.72 0.025 243.72` | Muted/secondary text |
| `--accent` | `0.94 0.022 243.72` | `0.33 0.025 243.72` | Accent hover background |
| `--accent-foreground` | `0.25 0.07 243.72` | `0.98 0.005 243.72` | Accent hover text |
| `--destructive` | `0.6 0.18 25` | `0.72 0.19 22.216` | Error, delete actions (red) |
| `--border` | `0.91 0.012 243.72` | `1 0 0 / 12%` | Borders |
| `--input` | `0.91 0.012 243.72` | `1 0 0 / 18%` | Input borders |
| `--ring` | `0.6984 0.1458 243.72` | `0.6984 0.1458 243.72` | Focus rings |

**Sidebar tokens** (light / dark):
| Token | Light Value | Dark Value |
|---|---|---|
| `--sidebar` | `0.985 0.005 243.72` | `0.23 0.016 243.72` |
| `--sidebar-foreground` | `0.22 0.025 243.72` | `0.98 0.005 243.72` |
| `--sidebar-primary` | `0.6984 0.1458 243.72` | `0.6984 0.1458 243.72` |
| `--sidebar-primary-foreground` | `0.99 0.003 243.72` | `0.99 0.003 243.72` |
| `--sidebar-accent` | `0.94 0.022 243.72` | `0.33 0.025 243.72` |
| `--sidebar-accent-foreground` | `0.22 0.025 243.72` | `0.98 0.005 243.72` |
| `--sidebar-border` | `0.91 0.012 243.72` | `1 0 0 / 12%` |
| `--sidebar-ring` | `0.6984 0.1458 243.72` | `0.6984 0.1458 243.72` |

**Chart scale**:
- `--chart-1`: `0.6984 0.1458 243.72`
- `--chart-2`: `0.8269 0.126 154.5`
- `--chart-3`: `0.855 0.165 72.8`
- `--chart-4`: `0.735 0.187 296.3`
- `--chart-5`: `0.72 0.17 13.4`

### Border Radius
Base `--radius: 0.625rem`. Scale: `sm(×0.6)` `md(×0.8)` `lg(×1)` `xl(×1.4)` `2xl(×1.8)` `3xl(×2.2)` `4xl(×2.6)`.

Conventions:
- Button, Input: `rounded-lg`
- Dialog, Popover, Sheet: `rounded-xl`
- Avatar: `rounded-full`
- Badge pill: `rounded-4xl`

### Spacing
Tailwind 4px grid. No custom tokens. Common patterns: field gap `gap-4`, group gap `gap-5`, card padding `p-4`, icon gap `gap-1.5`.

### Global Utilities (`styles.css`)
- `no-scrollbar` — hide scrollbar cross-browser
- `bg-stripes` — diagonal striped background (used for placeholder areas)
- Default Scrollbar: track transparent, thumb `bg-border rounded-full`, hover `bg-muted-foreground/50`

## 2. Component Library

**Import alias:** `@/*` → `src/*` (tsconfig.json). Use `@/components/ui/button`, `@/features/tasks/queries`, etc.

- Always use components from `@/components/ui`, `@/components/common`, `@/components/layout`, `@/components/decorations`. Avoid creating custom `<div>`s to replace existing components.
- Each component has its own composition; ensure you adhere to it. See the Shadcn component composition section in this AGENTS.md file.

## 3. UX Patterns

### Form Pattern (TanStack Form + Zod)

The project uses **`@tanstack/react-form`** — DO NOT use `react-hook-form`. Schema validation with **Zod** in `features/[name]/schemas/`.

Standard field pattern:
```tsx
<form.Field name="title">
  {(field) => {
    const isInvalid = field.state.meta.isTouched && !!field.state.meta.errors.length
    return (
      <Field data-invalid={isInvalid}>
        <FieldLabel htmlFor={field.name}>Title</FieldLabel>
        <Input
          id={field.name}
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          aria-invalid={isInvalid}
        />
        <FieldError errors={field.state.meta.errors} />
      </Field>
    )
  }}
</form.Field>
```

The submit button uses `form.Subscribe` to read `canSubmit`:
```tsx
<form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting]}>
  {([canSubmit]) => (
    <Button type="submit" disabled={!canSubmit || mutation.isPending}>
      {mutation.isPending && <Loader2Icon className="animate-spin" />}
      Save
    </Button>
  )}
</form.Subscribe>
```

Validators are declared at the form level: `validators: { onSubmit: ZodSchema }`.

### UI Query States Pattern (Loading / Error / Empty)

Every component performing asynchronous queries (via `useQuery`, etc.) **MUST** consistently handle three fundamental states using standard UI components. Under no circumstances should errors be swallowed or hidden as fake empty states.

#### 1. Standard Implementations (Main Content & Lists)

| State | Component & Pattern | Requirement |
|---|---|---|
| **Loading** | `<Skeleton>` (from `ui/skeleton`) | Hardcoded count/layout matching the expected content structure. Avoid hydration mismatch. |
| **Error** | `<Alert variant="destructive">` | Pass error to `getErrorMessage(error, "fallback")` to display standardized error alerts. |
| **Empty** | `<Empty>` (full composition) | Use `<EmptyHeader>`, `<EmptyMedia>`, `<EmptyTitle>`, and actionable `<EmptyContent>`. |

#### 2. Exception Cases (Special Spaces & Compact UI)
In confined layout spaces like Sidebars, inline status rows, small widgets, or badges, rendering full-scale `Alert` or `Empty` components will break visual flow.

* **Compact Error:** Render a small inline error text using a tiny icon (e.g. `AlertCircle` 3.5/4) and `text-destructive text-xs` instead of the full `<Alert>` component.
* **Compact Empty:** Render a simple, minimal helper text (e.g. `text-xs text-muted-foreground`) instead of the full `<Empty>` layout.
* **Skeleton Obligation:** Even in compact environments, the loading state **MUST at least have an inline `<Skeleton>`** to prevent layout shifting and flash-of-unstyled-content (FOUC).

---

### Toast (Sonner)
- Use toast to notify users of high-priority mutations or actions. Avoid displaying toasts for minor or brief interactions.

```ts
toast.success("Saved successfully")
toast.error("An error occurred")
toast.promise(fn, { loading: "Processing...", success: "Done!", error: "Failed" })
```
Icons: `CircleCheck(success)` `Info(info)` `TriangleAlert(warning)` `OctagonX(error)` `Loader2(loading)`.

## 4. Conventions & Governance

### File Structure
```
src/
├── components/
│   ├── ui/           # Atoms + Molecules (shadcn-based)
│   ├── common/       # Reusable organisms (DataTable, DatePicker...)
│   ├── layout/       # App shell (Sidebar, PageHeader, ViewMode)
│   └── decorations/  # Decorative elements (PixelBackground)
└── features/[name]/
    ├── components/   # Feature-specific components
    ├── schemas/      # Zod schemas + types
    └── queries/      # TanStack Query options + mutations
```

### Animation
- Dialog open/close: `data-open:animate-in fade-in zoom-in-95` / `data-closed:zoom-out-95`, 100ms
- Skeleton: `animate-pulse` | Spinner: `animate-spin`
- Do not add custom keyframes when Tailwind/tw-animate-css already provides them

### TanStack Query Convention

TanStack Query, TanStack Router, and TanStack Start form the only approved server-state stack for this project. Follow these rules for every new feature and every refactor that touches data fetching or mutations.

**Server function layering**:
- `server.ts` contains server-only API/client/database logic and imports `"@tanstack/react-start/server-only"`.
- `functions.ts` contains `createServerFn` wrappers and is safe to import from routes/components.
- `queries.ts` contains query key factories, `queryOptions`, and mutation hooks/options.
- Never export `server.ts` from a feature barrel.

**Query functions must throw on failure**:
- A query function must resolve valid data or throw/reject. Do not catch an API error and return `null`, `undefined`, `{ error }`, or an empty collection as a failure fallback.
- Ky throws `HTTPError` for non-2xx responses by default. Let that error propagate to TanStack Query unless there is a deliberate domain case.
- If `404` is a valid domain state, handle only that status explicitly and document why. Otherwise throw `notFound()` or rethrow the original error.
- Do not log-and-swallow errors in `server.ts`. Generic API error messages are normalized once in `src/lib/ky.ts` with Ky hooks.

**Query key factory** - each feature defines a `[feature]Keys` object:
```ts
export const projectKeys = {
  all: ["projects"] as const,
  lists: () => [...projectKeys.all, "list"] as const,
  list: (params) => [...projectKeys.lists(), params] as const,
  detail: (id: string) => [...projectKeys.all, "detail", id] as const,
}
```

**Query options** - export factory functions, not custom query hooks:
```ts
export const projectQueryOptions = (id: string) =>
  queryOptions({
    queryKey: projectKeys.detail(id),
    queryFn: () => getProjectByIdFn({ data: { projectId: id } }),
  })
```

Use the same query options in route loaders, components, and cache APIs:
```ts
await context.queryClient.ensureQueryData(projectQueryOptions(projectId))
const { data } = useSuspenseQuery(projectQueryOptions(projectId))
```

**Route loader policy**:
- Critical route data uses `loader` + `context.queryClient.ensureQueryData(...)`.
- Secondary widgets use `void context.queryClient.prefetchQuery(...)` when their failure should not block the page.
- Components that consume loader-prefetched critical data should prefer `useSuspenseQuery` or `useSuspenseQueries`.
- Non-critical widgets may use `useQuery`, but must render a consistent loading, error, and empty state.
- Route composition stays in `src/routes`; feature modules should not couple other features together.

**Suspense and optional query rules**:
- Required/Suspense query options should not use `enabled`; route params are expected to be valid because the route owns the precondition.
- Optional, search, inline, or component-local queries may use `enabled`.
- Never default a failed query to `[]`, `null`, or an empty UI. Empty state is only for valid empty data.
- Route resources that are missing should convert a known `HTTPError 404` into `notFound()`; unknown errors must be rethrown.
- Add nested `errorComponent` boundaries to important layout routes so one section can fail without replacing the whole app shell.

**Mutations** - group into a single `use[Feature]Mutations()` hook, invalidating the correct query key scope:
```ts
export const useProjectMutations = () => {
  const queryClient = useQueryClient()
  const create = useMutation({
    mutationFn: createProjectFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: projectKeys.lists() }),
  })
  return { create, update, remove }
}
```

Mutation rules:
- Mutation hooks own cache behavior: invalidation, optimistic updates, rollback, and direct cache writes.
- Components own UX behavior: toast messages, dialog open/close, local status, and navigation.
- Avoid putting `toast`, `router.navigate`, or component-specific state transitions inside shared mutation hooks unless the mutation is only ever used by one UI flow and that coupling is documented.
- Use `mutateAsync` only when the component needs to compose follow-up side effects; otherwise use `mutate` with callback options.
- Await invalidation promises in `onSuccess` when UI pending state should last until the cache is updated.

**QueryClient lifecycle**:
- In SSR/TanStack Start contexts, do not create a request-shared QueryClient singleton for user data.
- Prefer a per-request/per-router QueryClient factory (`createQueryClient`) and pass the same instance to Router context and `QueryClientProvider`.
- Clearing auth state must clear the active QueryClient instance from context, not an unrelated imported singleton.

**Ky error normalization**:
- Keep auth headers, refresh retry, auth redirects, and generic backend error message normalization in `src/lib/ky.ts`.
- Keep `prefix` for Ky v2 API roots in this project; do not introduce `prefixUrl`.
- Use Ky v2 `beforeError` to set a readable `error.message` from common backend payloads. The hook receives `({ error })`, and parsed payloads are available on `HTTPError.data`.
- Do not call `error.response.json()` inside `beforeError`; Ky v2 consumes the response body while populating `error.data`.
- Do not parse/clone `error.response` in feature server functions just to create generic messages.
- Feature functions may catch specific domain cases, such as `HTTPError` 404 -> `notFound()`, and must rethrow unknown errors.
- Components and mutation callbacks should use `getErrorMessage(error, fallback)` from `src/lib/error.ts` for user-facing failure text.
- Never normalize API failures by returning `null`, `[]`, or `{ error }`.

### Naming
| Type | Convention | Example |
|---|---|---|
| File | kebab-case | `role-badge.tsx` |
| Component | PascalCase | `RoleBadge` |
| CVA var | camelCase + `Variants` | `buttonVariants` |
| data-slot | kebab-case | `data-slot="field-error"` |
| Query key object | camelCase + `Keys` | `projectKeys` |
| Query options fn | camelCase + `QueryOptions` | `projectQueryOptions` |
| Mutation hook | `use` + PascalCase + `Mutations` | `useProjectMutations` |

- Alert:
Alert
├── Icon
├── AlertTitle
├── AlertDescription
└── AlertAction

- AlertDialog:
AlertDialog
├── AlertDialogTrigger
└── AlertDialogContent
    ├── AlertDialogHeader
    │   ├── AlertDialogMedia
    │   ├── AlertDialogTitle
    │   └── AlertDialogDescription
    └── AlertDialogFooter
        ├── AlertDialogCancel
        └── AlertDialogAction

- Accordion:
Accordion
├── AccordionItem
│   ├── AccordionTrigger
│   └── AccordionContent
└── AccordionItem
    ├── AccordionTrigger
    └── AccordionContent

- Avatar:
Avatar
├── AvatarImage
├── AvatarFallback
└── AvatarBadge

AvatarGroup
├── Avatar
│   ├── AvatarImage
│   ├── AvatarFallback
│   └── AvatarBadge
├── Avatar
│   ├── AvatarImage
│   ├── AvatarFallback
│   └── AvatarBadge
└── AvatarGroupCount

- Breadcrumb:
Breadcrumb
└── BreadcrumbList
    ├── BreadcrumbItem
    │   └── BreadcrumbLink
    ├── BreadcrumbSeparator
    ├── BreadcrumbItem
    │   └── BreadcrumbLink
    ├── BreadcrumbSeparator
    └── BreadcrumbItem
        └── BreadcrumbPage

- Carousel:
Carousel
├── CarouselContent
│   ├── CarouselItem
│   └── CarouselItem
├── CarouselPrevious
└── CarouselNext

- Collapsible:
Collapsible
├── CollapsibleTrigger
└── CollapsibleContent

- Card:
Card
├── CardHeader
│   ├── CardTitle
│   ├── CardDescription
│   └── CardAction
├── CardContent
└── CardFooter

- ContextMenu:
ContextMenu
├── ContextMenuTrigger
└── ContextMenuContent
    ├── ContextMenuGroup
    │   ├── ContextMenuLabel
    │   ├── ContextMenuItem
    │   └── ContextMenuItem
    ├── ContextMenuSeparator
    ├── ContextMenuGroup
    │   ├── ContextMenuLabel
    │   ├── ContextMenuCheckboxItem
    │   └── ContextMenuCheckboxItem
    ├── ContextMenuSeparator
    ├── ContextMenuGroup
    │   ├── ContextMenuLabel
    │   └── ContextMenuRadioGroup
    │       ├── ContextMenuRadioItem
    │       └── ContextMenuRadioItem
    └── ContextMenuSub
        ├── ContextMenuSubTrigger
        └── ContextMenuSubContent
            └── ContextMenuGroup
                ├── ContextMenuItem
                └── ContextMenuItem

- Date Picker (composition):
Popover
├── PopoverTrigger
└── PopoverContent
    └── Calendar

- Command:
Command
├── CommandInput
└── CommandList
    ├── CommandEmpty
    ├── CommandGroup
    │   ├── CommandItem
    │   └── CommandItem
    ├── CommandSeparator
    └── CommandGroup
        ├── CommandItem
        └── CommandItem

- Combobox (Simple):
Combobox
├── ComboboxInput
└── ComboboxContent
    ├── ComboboxEmpty
    └── ComboboxList
        ├── ComboboxItem
        └── ComboboxItem

- Combobox (With chips):
Combobox
├── ComboboxChips
│   ├── ComboboxValue
│   │   └── ComboboxChip
│   └── ComboboxChipsInput
└── ComboboxContent
    ├── ComboboxEmpty
    └── ComboboxList
        ├── ComboboxItem
        └── ComboboxItem

- Combobox (With groups):
Combobox
├── ComboboxInput
└── ComboboxContent
    ├── ComboboxEmpty
    └── ComboboxList
        ├── ComboboxGroup
        │   ├── ComboboxLabel
        │   └── ComboboxCollection
        │       ├── ComboboxItem
        │       └── ComboboxItem
        ├── ComboboxSeparator
        └── ComboboxGroup
            ├── ComboboxLabel
            └── ComboboxCollection
                ├── ComboboxItem
                └── ComboboxItem

- DropdownMenu:
DropdownMenu
├── DropdownMenuTrigger
└── DropdownMenuContent
    ├── DropdownMenuGroup
    │   ├── DropdownMenuLabel
    │   ├── DropdownMenuItem
    │   └── DropdownMenuItem
    ├── DropdownMenuSeparator
    ├── DropdownMenuGroup
    │   ├── DropdownMenuLabel
    │   ├── DropdownMenuCheckboxItem
    │   └── DropdownMenuCheckboxItem
    ├── DropdownMenuSeparator
    ├── DropdownMenuGroup
    │   ├── DropdownMenuLabel
    │   └── DropdownMenuRadioGroup
    │       ├── DropdownMenuRadioItem
    │       └── DropdownMenuRadioItem
    └── DropdownMenuSub
        ├── DropdownMenuSubTrigger
        └── DropdownMenuSubContent
            └── DropdownMenuGroup
                ├── DropdownMenuLabel
                ├── DropdownMenuItem
                └── DropdownMenuItem

- Dialog:
Dialog
├── DialogTrigger
└── DialogContent
    ├── DialogHeader
    │   ├── DialogTitle
    │   └── DialogDescription
    └── DialogFooter

- Drawer:
Drawer
├── DrawerTrigger
└── DrawerContent
    ├── DrawerHeader
    │   ├── DrawerTitle
    │   └── DrawerDescription
    └── DrawerFooter

- Empty:
Empty
├── EmptyHeader
│   ├── EmptyMedia
│   ├── EmptyTitle
│   └── EmptyDescription
└── EmptyContent

- InputGroup:
InputGroup
├── InputGroupInput or InputGroupTextarea
├── InputGroupAddon
├── InputGroupButton
└── InputGroupText

- Field (Field):
Field
├── FieldLabel
├── Input / Textarea / Switch / Select
├── FieldDescription
└── FieldError

- Field (FieldGroup):
FieldGroup
├── Field
│   ├── FieldLabel
│   ├── Input / Textarea / Switch / Select
│   ├── FieldDescription
│   └── FieldError
├── FieldSeparator
└── Field
    ├── FieldLabel
    └── Input / Textarea / Switch / Select

- Field (FieldSet):
FieldSet
├── FieldLegend
├── FieldDescription
└── FieldGroup
    ├── Field
    │   ├── FieldLabel
    │   ├── Input / Textarea / Switch / Select
    │   ├── FieldDescription
    │   └── FieldError
    └── Field
        ├── FieldLabel
        └── Input / Textarea / Switch / Select

- HoverCard:
HoverCard
├── HoverCardTrigger
└── HoverCardContent

- ButtonGroup:
ButtonGroup
├── Button or Input
├── ButtonGroupSeparator
└── ButtonGroupText

- InputOTP:
InputOTP
├── InputOTPGroup
│   ├── InputOTPSlot
│   ├── InputOTPSlot
│   └── InputOTPSlot
├── InputOTPSeparator
├── InputOTPGroup
│   ├── InputOTPSlot
│   ├── InputOTPSlot
│   └── InputOTPSlot
├── InputOTPSeparator
└── InputOTPGroup
    ├── InputOTPSlot
    └── InputOTPSlot

- Menubar:
Menubar
├── MenubarMenu
│   ├── MenubarTrigger
│   └── MenubarContent
│       ├── MenubarGroup
│       │   ├── MenubarLabel
│       │   ├── MenubarItem
│       │   └── MenubarItem
│       ├── MenubarSeparator
│       ├── MenubarGroup
│       │   ├── MenubarLabel
│       │   ├── MenubarCheckboxItem
│       │   └── MenubarCheckboxItem
│       ├── MenubarSeparator
│       ├── MenubarGroup
│       │   ├── MenubarLabel
│       │   └── MenubarRadioGroup
│       │       ├── MenubarRadioItem
│       │       └── MenubarRadioItem
│       └── MenubarSub
│           ├── MenubarSubTrigger
│           └── MenubarSubContent
│               └── MenubarGroup
│                   ├── MenubarLabel
│                   ├── MenubarItem
│                   └── MenubarItem
└── MenubarMenu
    ├── MenubarTrigger
    └── MenubarContent
        └── MenubarGroup
            ├── MenubarLabel
            ├── MenubarItem
            └── MenubarItem

- NavigationMenu:
NavigationMenu
├── NavigationMenuList
│   ├── NavigationMenuItem
│   │   ├── NavigationMenuTrigger
│   │   └── NavigationMenuContent
│   │       ├── NavigationMenuLink
│   │       └── NavigationMenuLink
│   └── NavigationMenuItem
│       └── NavigationMenuLink
└── NavigationMenuIndicator

- Item:
ItemGroup
└── Item
    ├── ItemHeader
    ├── ItemMedia
    ├── ItemContent
    │   ├── ItemTitle
    │   └── ItemDescription
    ├── ItemActions
    └── ItemFooter

- Pagination:
Pagination
└── PaginationContent
    ├── PaginationItem
    │   └── PaginationPrevious
    ├── PaginationItem
    │   └── PaginationLink
    ├── PaginationItem
    │   └── PaginationEllipsis
    └── PaginationItem
        └── PaginationNext

- Kbd:
Kbd
KbdGroup
├── Kbd
└── Kbd

- NativeSelect (Simple):
NativeSelect
├── NativeSelectOption
├── NativeSelectOption
├── NativeSelectOption
└── NativeSelectOption

- NativeSelect (With groups):
NativeSelect
├── NativeSelectOptGroup
│   ├── NativeSelectOption
│   └── NativeSelectOption
└── NativeSelectOptGroup
    ├── NativeSelectOption
    └── NativeSelectOption

- RadioGroup:
RadioGroup
├── RadioGroupItem
└── RadioGroupItem

- Popover:
Popover
├── PopoverTrigger
└── PopoverContent

- ScrollArea:
ScrollArea
└── ScrollBar

- ResizablePanelGroup:
ResizablePanelGroup
├── ResizablePanel
├── ResizableHandle
└── ResizablePanel

- Select:
Select
├── SelectTrigger
│   └── SelectValue
└── SelectContent
    ├── SelectGroup
    │   ├── SelectLabel
    │   ├── SelectItem
    │   └── SelectItem
    ├── SelectSeparator
    └── SelectGroup
        ├── SelectLabel
        ├── SelectItem
        └── SelectItem

- Sheet:
Sheet
├── SheetTrigger
└── SheetContent
    ├── SheetHeader
    │   ├── SheetTitle
    │   └── SheetDescription
    └── SheetFooter

- Sidebar:
SidebarProvider
├── Sidebar
│   ├── SidebarHeader
│   ├── SidebarContent
│   │   ├── SidebarGroup
│   │   │   ├── SidebarGroupLabel
│   │   │   ├── SidebarGroupAction
│   │   │   ├── SidebarGroupContent
│   │   │   └── SidebarMenu
│   │   │       ├── SidebarMenuItem
│   │   │       │   ├── SidebarMenuButton
│   │   │       │   ├── SidebarMenuAction
│   │   │       │   └── SidebarMenuBadge
│   │   │       └── SidebarMenuItem
│   │   │           ├── SidebarMenuButton
│   │   │           └── SidebarMenuSub
│   │   │               ├── SidebarMenuSubItem
│   │   │               └── SidebarMenuSubItem
│   │   └── SidebarGroup
│   │       └── SidebarMenu
│   │           ├── SidebarMenuItem
│   │           └── SidebarMenuItem
│   ├── SidebarFooter
│   └── SidebarRail
├── SidebarInset
└── SidebarTrigger

- Table:
Table
├── TableCaption
├── TableHeader
│   └── TableRow
│       ├── TableHead
│       ├── TableHead
│       ├── TableHead
│       └── TableHead
├── TableBody
│   ├── TableRow
│   │   ├── TableCell
│   │   ├── TableCell
│   │   ├── TableCell
│   │   └── TableCell
│   └── TableRow
│       ├── TableCell
│       ├── TableCell
│       ├── TableCell
│       └── TableCell
└── TableFooter

- Tabs:
Tabs
├── TabsList
│   ├── TabsTrigger
│   └── TabsTrigger
├── TabsContent
└── TabsContent

- ToggleGroup:
ToggleGroup
├── ToggleGroupItem
└── ToggleGroupItem

- Tooltip:
Tooltip
├── TooltipTrigger
└── TooltipContent

# 🛡️ Code Quality & Coding Standards

## 1. Quality Assurance & Required Checks (Pre-commit)

To maintain stability without sacrificing developer velocity, these checks **should NOT be run repeatedly for every minor code change**. Instead, run them **after completing major work items or changes that span across multiple files** or manualy.

1. **Linter & Formatter (Biome)**:
   ```bash
   pnpx @biomejs/biome check --write
   ```
   *Analyzes, lints, formats, and cleans up import organization across all files automatically.*

2. **TypeScript Compiler**:
   ```bash
   pnpm typecheck
   ```
   *Validates that all types compile cleanly without emitting errors or warnings (`tsc --noEmit`).*

3. **Production Build**:
   ```bash
   pnpm build
   ```
   *Ensures the full application compiles cleanly into a production bundle.*

## 2. Strict Code Safety Policies

### 🚫 2.1 Banned Non-Null Assertions (`!`)
Using non-null assertions (`!`) to bypass compiler checks is **strictly prohibited**. 
* **Reason**: Using `!` introduces dangerous assumptions that frequently lead to runtime failures (`Cannot read properties of undefined`).
* **Correct Approaches**:
  * **Safe Fallbacks**: Use logical OR operators (`||`).
    ```typescript
    // Wrong:
    const id = task.project_id!;
    // Correct:
    const id = task.project_id || "all";
    ```
  * **Optional Chaining**: Use `?.` to safely access deep nested properties.
    ```typescript
    const name = member?.profile?.name;
    ```
  * **Guard Clauses**: Check conditions explicitly to narrow types safely.
    ```typescript
    if (!canvasRef.current) return;
    const canvas = canvasRef.current; // Now safely guaranteed non-null
    ```

### 🏷️ 2.2 Explicit Button Types
To avoid unintended form submissions, all custom `<button>` elements or component triggers **must have an explicit `type` attribute** (such as `type="button"` or `type="submit"`).

## 3. TanStack Form Pattern (Type-safe Forms)

Agentick uses **`@tanstack/react-form`** with **Zod** schema validation. **Do not use `react-hook-form`**.

### Standard Field Structure:
```tsx
<form.Field name="title">
  {(field) => {
    const isInvalid = field.state.meta.isTouched && !!field.state.meta.errors.length;
    return (
      <Field data-invalid={isInvalid}>
        <FieldLabel htmlFor={field.name}>Tiêu đề</FieldLabel>
        <Input
          id={field.name}
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          aria-invalid={isInvalid}
        />
        <FieldError errors={field.state.meta.errors} />
      </Field>
    );
  }}
</form.Field>
```

### Submit Button Subscription:
Always use `form.Subscribe` to read `canSubmit` and prevent invalid submissions:
```tsx
<form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting]}>
  {([canSubmit]) => (
    <Button type="submit" disabled={!canSubmit || mutation.isPending}>
      {mutation.isPending && <Loader2Icon className="animate-spin" />}
      Lưu
    </Button>
  )}
</form.Subscribe>
```

## 4. Toast Notifications & Loading States

### Toast Conventions (Sonner)
Use `toast` to notify users about high-priority mutations or actions. Avoid displaying toasts for minor interactions.
```typescript
toast.success("Lưu thành công");
toast.error("Có lỗi xảy ra");
toast.promise(fn, { loading: "Đang xử lý...", success: "Xong!", error: "Thất bại" });
```

### Standard Loading States
* **List/Card Sections**: Use `<Skeleton>` with fixed, hardcoded counts instead of mapping indices to prevent hydration mismatches.
* **Mutating Buttons**: Add `disabled` attribute, show a `Loader2Icon` spinner with class `animate-spin`, and change the label text to `"Đang xử lý..."`.
* **Sidebar / Inline Loading**: Use `animate-pulse rounded bg-muted` inline to bypass hydration mismatches on server-rendered layouts.
