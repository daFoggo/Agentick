import type { IViewModeCatalogItem } from "@/types/view-mode-list"
import {
  Archive,
  Bookmark,
  ChartLine,
  ChartNoAxesGantt,
  Inbox,
  Kanban,
  LayoutDashboard,
  ListTree,
  Settings,
  Users,
} from "lucide-react"
import type { ReactNode } from "react"

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

export const TEAM_VIEW_MODE_CATALOG: IViewModeCatalogItem[] = [
  {
    value: "overview",
    label: "Overview",
    icon: LayoutDashboard,
    isDefault: true,
  },
  {
    value: "members",
    label: "Members",
    icon: Users,
  },
  {
    value: "settings",
    label: "Settings",
    icon: Settings,
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
