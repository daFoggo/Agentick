import type { TSidebarNavigation } from "@/types/sidebar"
import { ChartNoAxesGantt, Inbox, LayoutTemplate, Users } from "lucide-react"

export const SIDEBAR_NAVIGATION: TSidebarNavigation = [
  {
    items: [
      {
        title: "Overview",
        to: "/dashboard/overview",
        icon: LayoutTemplate,
      },
      {
        title: "My Tasks",
        to: "/dashboard/my-tasks",
        icon: ChartNoAxesGantt,
      },
      {
        title: "Inbox",
        to: "/dashboard/inbox",
        icon: Inbox,
      },
      {
        title: "Team",
        to: "/dashboard/team",
        icon: Users,
      },
    ],
  },
]
