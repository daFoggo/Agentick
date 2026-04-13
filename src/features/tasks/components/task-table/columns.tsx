import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  TASK_PRIORITY_CATALOG,
  TASK_STATUS_CATALOG,
  TASK_TYPE_CATALOG,
} from "@/features/tasks/constants"
import type { TTask } from "@/features/tasks"
import { ChevronDown, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { generateColumns } from "@/lib/data-table"

function formatDate(date?: Date) {
  if (!date) return "—"
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(date))
}

function getStatusOption(value: string) {
  return TASK_STATUS_CATALOG.find((s) => s.value === value)
}

function getPriorityOption(value: string) {
  return TASK_PRIORITY_CATALOG.find((p) => p.value === value)
}

function getTypeOption(value: string) {
  return TASK_TYPE_CATALOG.find((t) => t.value === value)
}

// ── Column definitions ─────────────────────────────────────────────────────

export const taskColumns = generateColumns<TTask>([
  // 1. Title (with expand for sub-tasks)
  {
    accessorKey: "title",
    label: "Title",
    size: 250,
    enablePinning: true,
    cell: ({ getValue }) => {
      return (
        <span className="truncate text-sm font-medium text-foreground">
          {getValue() as string}
        </span>
      )
    },
  },

  // 2. Type icon
  {
    accessorKey: "type",
    label: "Type",
    size: 100,
    cell: ({ getValue }) => {
      const type = getTypeOption(getValue() as string)
      if (!type) return null
      return (
        <span
          className="inline-flex items-center text-xs font-medium"
          style={{ color: type.color }}
          title={type.label}
        >
          <span className="max-w-[80px] truncate">{type.label}</span>
        </span>
      )
    },
  },

  // 3. Status
  {
    accessorKey: "status",
    label: "Status",
    size: 130,
    renderGroupValue: (value: string) => {
      const option = getStatusOption(value)
      return (
        <>
          {option && (
            <span
              className="size-2 shrink-0 rounded-full"
              style={{ backgroundColor: option.color }}
            />
          )}
          <span className="text-xs font-semibold tracking-wider text-foreground/80 uppercase">
            {option?.label ?? value}
          </span>
        </>
      )
    },
    cell: ({ getValue, row }) => {
      const status = getStatusOption(getValue() as string)
      if (!status) return null

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Badge
              variant="outline"
              className="cursor-pointer gap-1.5 font-normal transition-colors duration-300 ease-in-out hover:bg-muted/50"
              style={{ borderColor: status.color, color: status.color }}
            >
              <span
                className="size-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: status.color }}
              />
              {status.label}
              <ChevronDown className="size-3 opacity-50" />
            </Badge>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-[150px]">
            {TASK_STATUS_CATALOG.map((opt) => (
              <DropdownMenuItem
                key={opt.value}
                className="gap-2"
                onClick={() => {
                  console.log(
                    "Update status to",
                    opt.value,
                    "for task",
                    row.original.id
                  )
                }}
              >
                <span
                  className="size-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: opt.color }}
                />
                {opt.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },

  // 4. Priority
  {
    accessorKey: "priority",
    label: "Priority",
    size: 120,
    renderGroupValue: (value: string) => {
      const option = getPriorityOption(value)
      return (
        <>
          {option && (
            <span
              className="size-2 shrink-0 rounded-full"
              style={{ backgroundColor: option.color }}
            />
          )}
          <span className="text-xs font-semibold tracking-wider text-foreground/80 uppercase">
            {option?.label ?? value}
          </span>
        </>
      )
    },
    cell: ({ getValue, row }) => {
      const priority = getPriorityOption(getValue() as string)
      if (!priority) return null

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Badge
              variant="secondary"
              className="cursor-pointer gap-1.5 px-2 font-normal transition-colors duration-300 ease-in-out hover:bg-muted"
            >
              <span
                className="size-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: priority.color }}
              />
              {priority.label}
              <ChevronDown className="size-3 opacity-50" />
            </Badge>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-[130px]">
            {TASK_PRIORITY_CATALOG.map((opt) => (
              <DropdownMenuItem
                key={opt.value}
                className="gap-2"
                onClick={() => {
                  console.log(
                    "Update priority to",
                    opt.value,
                    "for task",
                    row.original.id
                  )
                }}
              >
                <span
                  className="size-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: opt.color }}
                />
                {opt.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },

  // 5. Assignee
  {
    accessorKey: "assignee",
    label: "Assignee",
    size: 150,
    cell: ({ getValue }) => {
      const assignee = getValue() as TTask["assignee"]
      if (!assignee)
        return <span className="text-xs text-muted-foreground">Unassigned</span>
      return (
        <div className="flex min-w-0 items-center gap-2">
          <Avatar className="size-5 shrink-0">
            <AvatarImage src={assignee.user?.avatar_url} />
            <AvatarFallback className="text-[10px]">
              {assignee.user?.name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span className="truncate text-xs">{assignee.user?.name}</span>
        </div>
      )
    },
  },

  // 6. Due date
  {
    accessorKey: "dueDate",
    label: "Due Date",
    size: 112,
    cell: ({ getValue }) => {
      const date = getValue() as string
      if (!date) return <span className="text-muted-foreground">—</span>
      const isPast = new Date(date) < new Date()
      return (
        <span className={isPast ? "text-xs text-destructive" : "text-xs"}>
          {formatDate(date as unknown as Date)}
        </span>
      )
    },
  },

  // 7. Estimated hours
  {
    accessorKey: "estimatedHours",
    label: "Estimated hours",
    header: "Est. (h)",
    size: 80,
    headerClassName: "text-right",
    cellClassName: "text-right tabular-nums",
    cell: ({ getValue }) => {
      const v = getValue()
      return <span className="text-xs">{v != null ? String(v) : "—"}</span>
    },
  },

  // 8. Actual hours
  {
    accessorKey: "actualHours",
    label: "Actual hours",
    header: "Act. (h)",
    size: 80,
    headerClassName: "text-right",
    cellClassName: "text-right tabular-nums",
    cell: ({ getValue }) => {
      const v = getValue()
      return <span className="text-xs">{v != null ? String(v) : "—"}</span>
    },
  },

  // 9. Actions (pinned right)
  {
    id: "actions",
    label: "Actions",
    size: 40,
    enablePinning: false,
    enableReorder: false,
    isActionColumn: true,
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="size-4" />
            <span className="sr-only">Open actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => console.log("Edit", row.original.id)}
          >
            <Pencil className="size-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => console.log("Delete", row.original.id)}
          >
            <Trash2 className="size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
])
