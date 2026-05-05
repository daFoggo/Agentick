import { Badge } from "@/components/ui/badge"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"

export const TimezoneViewer = () => {
  return (
    <SidebarMenuItem>
      <HoverCard openDelay={100} closeDelay={100}>
        <HoverCardTrigger>
          <SidebarMenuButton className="justify-between text-xs" size="sm">
            <span className="font-medium text-muted-foreground uppercase">
              time
            </span>
            <Badge variant="secondary" className="font-mono font-semibold">
              {new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Badge>
          </SidebarMenuButton>
        </HoverCardTrigger>
        <HoverCardContent align="start">
          <p>
            Current project time in the project's timezone. All dates, ranges,
            and graphs you see are matched to this timezone.
          </p>
        </HoverCardContent>
      </HoverCard>
    </SidebarMenuItem>
  )
}
