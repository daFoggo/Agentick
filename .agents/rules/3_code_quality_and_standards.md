---
trigger: always_on
---

# 🛡️ Code Quality & Coding Standards

This guide outlines strictly enforced quality standards, linter rules, form validation patterns, and code safety policies for the **Agentick Frontend** project.

---

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

---

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

---

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

---

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