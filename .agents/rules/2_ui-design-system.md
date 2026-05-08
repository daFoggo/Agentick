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
| `--secondary` | `0.95 0.015 243.72` | `0.26 0.02 243.72` | Secondary background |
| `--secondary-foreground` | `0.35 0.08 243.72` | `0.98 0.005 243.72` | Secondary text |
| `--muted` | `0.965 0.01 243.72` | `0.24 0.018 243.72` | Soft muted background |
| `--muted-foreground` | `0.52 0.025 243.72` | `0.72 0.025 243.72` | Muted/secondary text |
| `--accent` | `0.94 0.022 243.72` | `0.28 0.025 243.72` | Accent hover background |
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
| `--sidebar-accent` | `0.94 0.022 243.72` | `0.28 0.025 243.72` |
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

---

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

### Loading States

| Case | Pattern |
|---|---|
| List / card section | `<Skeleton>` — hardcoded count, do not map index |
| Submitting button | `disabled` + `<Loader2Icon className="animate-spin" />` + "Processing..." text |
| Sidebar / compact area | `animate-pulse rounded bg-muted` inline (to avoid hydration mismatch) |
| Route / page transition | `<Suspense fallback={...}>` |
| Pagination / load more | Spinner at the end of the list, do not replace the entire list |
| Optimistic UI | `onMutate` + `queryClient.setQueryData` to update the cache early, rollback in `onError` |

- For empty states: always use `<Empty>` with full composition. Do not customize.

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