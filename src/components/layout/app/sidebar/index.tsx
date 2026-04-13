import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { SIDEBAR_PERSONAL, SIDEBAR_TEAM } from "@/constants/sidebar-navigation"
import { SidebarProjectList } from "@/features/projects"
import { Suspense } from "react"
import { HeaderContent } from "./header-content"
import { SidebarGroupSection } from "./sidebar-navigation"
import { TeamSwitcher } from "./team-switcher"
import { ThemeToggleWrapper } from "./theme-toggle-wrapper"
import { TimezoneViewer } from "./timezone-viewer"
import { UserProfile } from "./user-profile"

export const AppSidebar = () => {
  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <HeaderContent />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <TeamSwitcher />
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroupSection group={SIDEBAR_PERSONAL} />

        <SidebarProjectList />

        <SidebarGroupSection group={SIDEBAR_TEAM} />

        <SidebarGroup className="mt-auto">
          <SidebarMenu>
            <TimezoneViewer />
            <ThemeToggleWrapper />
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <Suspense
            fallback={
              <SidebarMenuItem>
                <SidebarMenuButton disabled>
                  <div className="flex items-center gap-2">
                    <div className="size-8 animate-pulse rounded-full bg-muted" />
                    <div className="flex flex-col gap-1">
                      <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                      <div className="h-2 w-24 animate-pulse rounded bg-muted" />
                    </div>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            }
          >
            <UserProfile />
          </Suspense>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
