---
trigger: always_on
---

# Documentation and Handbook Rules

The current canonical project documentation lives in `docs/handbook/`.

## Document Roles

- `README.md`: project overview, setup, handbook links, and tech-stack links.
- `AGENTS.md`: short agent entry point and high-signal rules.
- `.agents/rules/`: enforcement-oriented agent rules.
- `docs/handbook/`: detailed canonical development patterns.

## Update Rules

Update the handbook when project-wide patterns change for:

- architecture boundaries
- feature module structure
- TanStack Query/Router/Start usage
- Ky error normalization
- UI loading/error/empty states
- mutation side effects
- quality gates

Keep `AGENTS.md` concise and link to the handbook for details.
