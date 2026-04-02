import type { LucideIcon } from "lucide-react"
import {
  Archive,
  Bookmark,
  ChartLine,
  ChartNoAxesGantt,
  Inbox,
  Kanban,
  ListTree,
} from "lucide-react"
import type { ReactNode } from "react"

export interface IViewModeCatalogItem {
  value: string
  label: string
  icon: LucideIcon
  isDefault?: boolean
  isVisibleByDefault?: boolean
  badge?: string | number | ReactNode
  badgeVariant?:
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "ghost"
    | "link"
}

export const PROJECT_VIEW_MODE_CATALOG: IViewModeCatalogItem[] = [
  {
    value: "dashboard",
    label: "Dashboard",
    icon: ChartLine,
    isDefault: true,
    isVisibleByDefault: true,
  },
  {
    value: "list",
    label: "List",
    icon: ListTree,
    isVisibleByDefault: true,
  },
  {
    value: "board",
    label: "Board",
    icon: Kanban,
    isVisibleByDefault: true,
  },
  {
    value: "timeline",
    label: "Timeline",
    icon: ChartNoAxesGantt,
    isVisibleByDefault: false,
  },
]

export const INBOX_VIEW_MODE_CATALOG: IViewModeCatalogItem[] = [
  {
    value: "active",
    label: "Active",
    icon: Inbox,
    isDefault: true,
  },
  {
    value: "bookmarks",
    label: "Bookmarks",
    icon: Bookmark,
  },
  {
    value: "archive",
    label: "Archive",
    icon: Archive,
  },
]

export const buildViewModes = <T extends string>(
  catalog: IViewModeCatalogItem[],
  renderers: Record<T, () => ReactNode>
) =>
  catalog
    .filter((mode) => mode.value in renderers)
    .map((mode) => ({
      value: mode.value,
      label: mode.label,
      icon: mode.icon,
      isDefault: mode.isDefault,
      isVisibleByDefault: mode.isVisibleByDefault,
      badge: mode.badge,
      badgeVariant: mode.badgeVariant,
      render: renderers[mode.value as T],
    }))
