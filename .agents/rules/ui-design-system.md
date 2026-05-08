---
trigger: always_on
---

# Agentick-FE UI Design System

## 0. AI Rules — Đọc trước

> Các quy tắc cứng, vi phạm là sai dù context thế nào.

- **KHÔNG** hardcode màu: `#xxx`, `bg-[#xxx]`, `rgb()`. Luôn dùng token mục 1.
- **KHÔNG** hardcode spacing lẻ: `p-[15px]`, `mt-[22px]`. Chỉ dùng scale Tailwind mặc định.
- **KHÔNG** hardcode font-size: `text-[15px]`. Chỉ dùng 6 cấp chuẩn Tailwind (`xs` `sm` `base` `lg` `xl` `2xl`).
- **KHÔNG** hardcode z-index: `z-[999]`. Chỉ dùng scale Tailwind 0–50.
- **KHÔNG** mix icon library. Chỉ dùng `lucide-react`.
- **KHÔNG** có 2 Primary button cùng viewport.
- **KHÔNG** trộn Anh–Việt trong cùng 1 page (trừ tên riêng / thuật ngữ kỹ thuật).
- **KHÔNG** animate `width / height / padding`. Chỉ animate `transform / opacity / color`.
- **KHÔNG** xoá focus ring của interactive elements.
- **KHÔNG** dùng `<Badge>` cho filter — Badge không có interactive state.
- **KHÔNG** dùng `react-hook-form` — dự án dùng `@tanstack/react-form`.
- **KHÔNG** dùng `window.confirm()` — dùng `AlertDialog`.
- **KHÔNG** tạo component mới nếu đã có trong `ui/` hay `common/` — extend qua `className`.
- **KHÔNG** dùng relative import path dài — chỉ dùng alias `@/*` → `src/*`.
- Mọi list / grid **PHẢI** có empty state + loading state.
- Mọi icon-only button **PHẢI** có `aria-label` hoặc `<span className="sr-only">`.
- Mọi input **PHẢI** hỗ trợ 5 states: default, focus, error, disabled, readonly.
- Mọi touch target trên mobile **≥ 44×44px**.
- Mọi component mới **PHẢI** có `data-slot` trên root element.
- Mọi component có ≥ 2 variants **PHẢI** dùng **CVA**.
- Error state dùng `aria-invalid` — không custom class riêng.
- Animation **PHẢI** dùng `motion-safe:` / `motion-reduce:` để respect `prefers-reduced-motion`.
- Dark mode class-based `.dark` — test cả 2 theme trước khi ship.
---

## 1. Foundation — Design Tokens

### Typography
| Token | Value | Dùng cho |
|---|---|---|
| `--font-sans` | `"Google Sans Variable"` | Body, label, input |
| `--font-mono` | `"Google Sans Code Variable"` | Code |
| `--font-heading` | alias `--font-sans` | Dialog title, card title, empty title |

Quy ước font cho ui:
- Page heading: Fontsize 2xl, xl. Font weight: semibold, bold.
- Section title: Fontsize lg, md. Font weight: semibold, medium.
- Card, Modal, other components title: Sử dụng font size và font weight mặc định của component shadcn cung cấp. Nếu có nhu cầu thì dev mới chủ động điều chỉnh.
- Body: Tùy thuộc vào điều kiện như là một phần UI lớn hay nhỏ mà sử dụng các cấp từ text base, sm → xs. Font weight: medium → normal.
- Label: Sử dụng mặc định của components. Trong trường hợp cần custom, thường font weight sm, xs, font weight: medium, normal.
- Luôn sử dụng chuẩn các cấp font size và weight do Tailwind cung cấp, không được phép custom giá trị lẻ ngoài scale.

### Color Tokens (OKLCH — không hardcode màu)
- Mapping từ style.css của dự án.

**Light (`:root`)**
| Token | Dùng cho |
|---|---|
| `--background` | Nền trang |
| `--foreground` | Text chính |
| `--card` / `--popover` | Nền card, dialog |
| `--primary` `oklch(0.5 0.134 242.749)` | Màu chủ đạo (xanh) |
| `--secondary` | Nền secondary |
| `--muted` / `--muted-foreground` | Nền nhẹ / text phụ |
| `--destructive` `oklch(0.577 0.245 27.325)` | Lỗi, xóa |
| `--border` / `--input` / `--ring` | Border, focus ring |

**Dark (`.dark`)**: background `oklch(0.165 0 0)`, card `oklch(0.225 0 0)`, border `oklch(1 0 0 / 12%)`, input `oklch(1 0 0 / 18%)`.

**Sidebar tokens** (light / dark):
| Token | Light | Dark |
|---|---|---|
| `--sidebar` | `oklch(0.985 0 0)` | `oklch(0.225 0 0)` |
| `--sidebar-foreground` | `oklch(0.145 0 0)` | `oklch(0.98 0 0)` |
| `--sidebar-primary` | `oklch(0.588 0.158 241.966)` | `oklch(0.63 0.145 237.323)` |
| `--sidebar-accent` | `oklch(0.97 0 0)` | `oklch(0.295 0 0)` |
| `--sidebar-border` | `oklch(0.922 0 0)` | `oklch(1 0 0 / 12%)` |

**Chart scale**: `--chart-1` → `--chart-5` (blue palette, oklch 0.828 → 0.443).

### Border Radius
Base `--radius: 0.625rem`. Scale: `sm(×0.6)` `md(×0.8)` `lg(×1)` `xl(×1.4)` `2xl(×1.8)` `3xl(×2.2)` `4xl(×2.6)`.

Quy ước:
- Button, Input: `rounded-lg`
- Dialog, Popover, Sheet: `rounded-xl`
- Avatar: `rounded-full`
- Badge pill: `rounded-4xl`

### Spacing
Tailwind 4px grid. Không có custom token. Pattern phổ biến: field gap `gap-4`, group gap `gap-5`, card padding `p-4`, icon gap `gap-1.5`.

### Global Utilities (`styles.css`)
- `no-scrollbar` — ẩn scrollbar cross-browser
- `bg-stripes` — nền kẻ sọc diagonal (dùng cho placeholder area)
- Scrollbar mặc định: track transparent, thumb `bg-border rounded-full`, hover `bg-muted-foreground/50`

---

## 2. Component Library

**Import alias:** `@/*` → `src/*` (tsconfig.json). Dùng `@/components/ui/button`, `@/features/tasks/queries`, v.v.

- Luôn dùng components từ `@/components/ui`, `@/components/common`, `@/components/layout`, `@/components/decorations`. Tránh tạo `<div>` custom thay thế component có sẵn.
- Mỗi component đều có composition riêng, cần đảm bảo tuân thủ theo. Xem `shadcn-ui-composition.md` cùng folder.

## 3. UX Patterns

### Form Pattern (TanStack Form + Zod)

Dự án dùng **`@tanstack/react-form`** — KHÔNG dùng `react-hook-form`. Schema validation với **Zod** trong `features/[name]/schemas/`.

Pattern chuẩn cho 1 field:
```tsx
<form.Field name="title">
  {(field) => {
    const isInvalid = field.state.meta.isTouched && !!field.state.meta.errors.length
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
    )
  }}
</form.Field>
```

Submit button dùng `form.Subscribe` để đọc `canSubmit`:
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

Validators khai báo ở cấp form: `validators: { onSubmit: ZodSchema }`.

### Loading States

| Case | Pattern |
|---|---|
| List / card section | `<Skeleton>` — fix cứng số lượng, không map index |
| Button đang submit | `disabled` + `<Loader2Icon className="animate-spin" />` + text "Đang xử lý..." |
| Sidebar / compact area | `animate-pulse rounded bg-muted` inline (tránh hydration mismatch) |
| Route / page transition | `<Suspense fallback={...}>` |
| Pagination / load more | Spinner ở cuối list, không replace toàn bộ list |
| Optimistic UI | `onMutate` + `queryClient.setQueryData` để update cache trước, rollback trong `onError` |

- Khi không có dữ liệu: luôn dùng `<Empty>` với composition đầy đủ. Không custom.

### Toast (Sonner)
- Sử dụng toast để thông báo khi thực hiện các hành động quan trọng, không sử dụng với các tương tác nhỏ, ngắn.

```ts
toast.success("Lưu thành công")
toast.error("Có lỗi xảy ra")
toast.promise(fn, { loading: "Đang xử lý...", success: "Xong!", error: "Thất bại" })
```
Icons: `CircleCheck(success)` `Info(info)` `TriangleAlert(warning)` `OctagonX(error)` `Loader2(loading)`.

---

## 4. Conventions & Governance

### File Structure
```
src/
├── components/
│   ├── ui/           # Atoms + Molecules (shadcn-based)
│   ├── common/       # Organisms tái dùng (DataTable, DatePicker...)
│   ├── layout/       # App shell (Sidebar, PageHeader, ViewMode)
│   └── decorations/  # Decorative (PixelBackground)
└── features/[name]/
    ├── components/   # Component riêng của feature
    ├── schemas/      # Zod schema + types
    └── queries/      # TanStack Query options + mutations
```

### Animation
- Dialog open/close: `data-open:animate-in fade-in zoom-in-95` / `data-closed:zoom-out-95`, 100ms
- Skeleton: `animate-pulse` | Spinner: `animate-spin`
- Không thêm custom keyframe khi Tailwind/tw-animate-css đã có sẵn

### TanStack Query Convention

**Query key factory** — mỗi feature định nghĩa 1 object `[feature]Keys`:
```ts
export const projectKeys = {
  all: ["projects"] as const,
  lists: () => [...projectKeys.all, "list"] as const,
  list: (params) => [...projectKeys.lists(), params] as const,
  detail: (id: string) => [...projectKeys.all, "detail", id] as const,
}
```

**Query options** — export factory function (không export hook):
```ts
export const projectQueryOptions = (id: string) =>
  queryOptions({ queryKey: projectKeys.detail(id), queryFn: () => getProjectByIdFn(id) })
```

**Mutations** — gộp vào 1 hook `use[Feature]Mutations()`, invalidate đúng key scope:
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
| Loại | Convention | Ví dụ |
|---|---|---|
| File | kebab-case | `role-badge.tsx` |
| Component | PascalCase | `RoleBadge` |
| CVA var | camelCase + `Variants` | `buttonVariants` |
| data-slot | kebab-case | `data-slot="field-error"` |
| Query key object | camelCase + `Keys` | `projectKeys` |
| Query options fn | camelCase + `QueryOptions` | `projectQueryOptions` |
| Mutation hook | `use` + PascalCase + `Mutations` | `useProjectMutations` |