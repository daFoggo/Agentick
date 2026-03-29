import type { TSidebarNavigation } from "@/types/sidebar"
import { CalendarRange, ChartNoAxesGantt, LayoutTemplate } from "lucide-react"

export const SIDEBAR_NAVIGATION: TSidebarNavigation = [
  {
    label: "",
    items: [
      {
        title: "Overview",
        to: "/dashboard/overview",
        icon: LayoutTemplate,
      },
      {
        title: "Schedule",
        to: "/dashboard/schedule",
        icon: CalendarRange,
      },
      {
        title: "Tasks",
        to: "/dashboard/tasks",
        icon: ChartNoAxesGantt,
      },
    ],
  },
]
