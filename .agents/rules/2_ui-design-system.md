---
trigger: always_on
---

# UI Design System Rules

Use these rules together with `docs/handbook/05_ui_state_patterns.md`.

## Hard Rules

- Do not hardcode raw colors, arbitrary spacing, arbitrary font sizes, or arbitrary z-indexes.
- Use design tokens and the Tailwind scale.
- Use `lucide-react` only for icons.
- Use existing components from `@/components/ui`, `@/components/common`, and `@/components/layout` before creating new ones.
- Do not use `react-hook-form`; use `@tanstack/react-form`.
- Do not use `window.confirm()`; use `AlertDialog`.
- Do not use `<Badge>` for interactive filters.
- Do not remove focus rings.
- Icon-only buttons require `aria-label` or screen-reader text.
- Inputs must support default, focus, error, disabled, and readonly states.
- Use `aria-invalid` for error states.
- Use `motion-safe:` / `motion-reduce:` for animation.

## Async UI States

Every local `useQuery` surface must distinguish:

- loading
- error
- valid empty
- valid data

Main content:

- Loading: `<Skeleton>` with hardcoded expected layout.
- Error: `<Alert variant="destructive">` with `getErrorMessage(error, fallback)`.
- Empty: full `<Empty>` composition with action where useful.

Compact spaces:

- Loading: inline `<Skeleton>`.
- Error: tiny icon plus `text-xs text-destructive`.
- Empty: minimal helper text.

## Submit-Critical Dependencies

If a query feeds payload data, default values, permissions, or selectable options, disable submit/action while loading or errored.

Do not let failures become:

- `order: 0`
- `user_id: ""`
- empty selectable options
- hidden avatars
- fake empty state
