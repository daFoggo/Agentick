import type { LucideIcon } from "lucide-react"
import type { LinkProps } from "@tanstack/react-router"

export interface ISidebarNavigationItem {
  title: string
  to: LinkProps["to"]
  icon?: LucideIcon
  children?: ISidebarNavigationItem[]
  isActive?: boolean
}

export interface ISidebarGroup {
  label?: string
  items: ISidebarNavigationItem[]
}

export type TSidebarNavigation = ISidebarGroup[]
