---
trigger: always_on
---

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

---

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

## 2. Component Library

**Import alias:** `@/*` → `src/*` (tsconfig.json). Use `@/components/ui/button`, `@/features/tasks/queries`, etc.

- Always use components from `@/components/ui`, `@/components/common`, `@/components/layout`, `@/components/decorations`. Avoid creating custom `<div>`s to replace existing components.
- Each component has its own composition; ensure you adhere to it. See `2_1_shadcn-ui-composition.md` in the same folder.

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

---

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

**Query key factory** — each feature defines a `[feature]Keys` object:
```ts
export const projectKeys = {
  all: ["projects"] as const,
  lists: () => [...projectKeys.all, "list"] as const,
  list: (params) => [...projectKeys.lists(), params] as const,
  detail: (id: string) => [...projectKeys.all, "detail", id] as const,
}
```

**Query options** — export factory function (do not export custom hooks):
```ts
export const projectQueryOptions = (id: string) =>
  queryOptions({ queryKey: projectKeys.detail(id), queryFn: () => getProjectByIdFn(id) })
```

**Mutations** — group into a single `use[Feature]Mutations()` hook, invalidating the correct query key scope:
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