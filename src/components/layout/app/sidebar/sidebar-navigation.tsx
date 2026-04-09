import { Link } from "@tanstack/react-router"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import type { ISidebarGroup } from "@/types/sidebar"

export const SidebarGroupSection = ({ group }: { group: ISidebarGroup }) => {
  return (
    <SidebarGroup key={group.label || "default"}>
      {group.label && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu className="gap-0.5">
          {group.items.map((item) => (
            <SidebarMenuItem key={item.to}>
              <Link to={item.to}>
                {({ isActive }) => (
                  <SidebarMenuButton tooltip={item.title} isActive={isActive}>
                    {item.icon && (
                      <item.icon
                        className={cn(
                          "transition-colors",
                          isActive ? "text-primary" : "text-muted-foreground"
                        )}
                      />
                    )}
                    <span
                      className={cn(
                        "transition-colors",
                        isActive ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {item.title}
                    </span>
                  </SidebarMenuButton>
                )}
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
