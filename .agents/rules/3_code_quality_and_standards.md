---
trigger: always_on
---

# Code Quality Rules

Use these rules together with `docs/handbook/06_quality_rules.md`.

## Checks

Run after larger work or before merge:

```bash
pnpm typecheck
pnpm build
pnpx @biomejs/biome check --write
```

Do not run expensive checks repeatedly for tiny edits unless requested.

## Safety

- Do not use non-null assertions to bypass types.
- Use guard clauses, optional chaining, and explicit narrowing.
- Custom `<button>` elements need explicit `type`.
- Do not revert user changes unless explicitly asked.
- Keep edits scoped to the requested behavior.

## Review Priorities

1. Runtime bugs and regressions.
2. Server-state and cache correctness.
3. SSR safety.
4. Loading/error/empty states.
5. Mutation invalidation and side effects.
6. Accessibility and design-system compliance.
7. Verification gaps.
