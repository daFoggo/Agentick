import { Link } from "@tanstack/react-router"
import { SIDEBAR_NAVIGATION } from "@/constants/sidebar-navigation"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

export const AllNavigation = () => {
  return (
    <>
      {SIDEBAR_NAVIGATION.map((group) => (
        <SidebarGroup key={group.label || "default"}>
          {group.label && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {group.items.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={item.isActive}
                  >
                    <Link to={item.to}>
                      {item.icon && (
                        <item.icon
                          className={cn(
                            "text-muted-foreground",
                            item.isActive && "text-primary"
                          )}
                        />
                      )}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  )
}
