# Feature Development

This document describes how to add or refactor a feature module in Agentick-FE.

## Feature Checklist

1. Create or update `src/features/[feature]/`.
2. Define schemas and types with Zod.
3. Put server-only API logic in `server.ts`.
4. Wrap server logic with `createServerFn` in `functions.ts`.
5. Define query keys, query options, and mutations in `queries.ts`.
6. Build feature-specific components in `components/`.
7. Export only client-safe modules from `index.ts`.
8. Compose the feature into pages from `src/routes/`.

## Import Rules

- Use `@/*` imports.
- Prefer feature barrels for public feature API.
- Do not export server-only code through feature barrels.
- `queries.ts` imports server functions from `functions.ts`, not from `server.ts`.
- `components/` should not import from `server.ts`.

## Forms

The project uses `@tanstack/react-form` with Zod validation.

Standard field shape:

```tsx
<form.Field name="title">
  {(field) => {
    const isInvalid =
      field.state.meta.isTouched && !!field.state.meta.errors.length

    return (
      <Field data-invalid={isInvalid}>
        <FieldLabel htmlFor={field.name}>Title</FieldLabel>
        <Input
          id={field.name}
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={(event) => field.handleChange(event.target.value)}
          aria-invalid={isInvalid}
        />
        <FieldError errors={field.state.meta.errors} />
      </Field>
    )
  }}
</form.Field>
```

Submit buttons should subscribe to form state:

```tsx
<form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
  {([canSubmit, isSubmitting]) => (
    <Button type="submit" disabled={!canSubmit || isSubmitting || mutation.isPending}>
      {mutation.isPending && <Loader2 className="animate-spin" />}
      Save
    </Button>
  )}
</form.Subscribe>
```

## Mutation Side Effects

Mutation hooks own server-state correctness:

- invalidation
- optimistic updates
- rollback
- direct cache writes

Components own user experience:

- toast messages
- dialog close/open state
- navigation
- local status
- form reset

Use `mutateAsync` only when the component needs to compose follow-up side effects.

## Async UI Requirements

Every `useQuery` surface needs explicit state handling:

- loading
- error
- empty, if the data can validly be empty

Do not write code where a failed query becomes:

- `[]`
- `null`
- hidden UI
- default `order: 0`
- empty selection options
- submit payload with missing `user_id` or `team_id`

If a query feeds submit-critical data, disable the action while the query is loading or errored.
