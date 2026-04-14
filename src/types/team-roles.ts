import type { TTeamRole } from "@/features/team-members/schemas"
import type { LucideIcon } from "lucide-react"

export interface ITeamRoleCatalogItem {
  value: TTeamRole
  label: string
  icon: LucideIcon
  variant: "default" | "secondary" | "outline" | "destructive"
  className: string
}
