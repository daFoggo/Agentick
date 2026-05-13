---
trigger: always_on
---

# shadcn Composition Rules

This project uses shadcn-style components as source code. Prefer existing component composition over custom markup.

## Required Composition

- Alert: `Alert`, optional icon, `AlertTitle`, `AlertDescription`, optional `AlertAction`.
- Dialog: `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`.
- AlertDialog: `AlertDialog`, `AlertDialogTrigger`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogFooter`, `AlertDialogCancel`, `AlertDialogAction`.
- Empty: `Empty`, `EmptyHeader`, `EmptyMedia`, `EmptyTitle`, `EmptyDescription`, `EmptyContent`.
- Field: `Field`, `FieldLabel`, input/select/textarea/switch, `FieldDescription`, `FieldError`.
- Select: `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectGroup`, `SelectItem`.
- DropdownMenu: `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuGroup`, items/separators as needed.
- Tooltip: `Tooltip`, `TooltipTrigger`, `TooltipContent`.
- Sidebar: use the existing sidebar primitives and menu components.
- Table: use table primitives instead of custom table-like divs.

## Rules

- Use `asChild`/component-supported trigger APIs where appropriate.
- Dialog, Sheet, and Drawer need a title for accessibility.
- Use `Skeleton` for loading placeholders.
- Use `Alert` for full-width error callouts.
- Use `Empty` for full empty states.
- Do not build custom replacements when an existing primitive exists.
