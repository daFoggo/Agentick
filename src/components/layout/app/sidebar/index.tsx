import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
} from "@/components/ui/sidebar"
import { AllNavigation } from "./all-navigation"
import { HeaderContent } from "./header-content"
import { ProjectSwitcher } from "./project-switcher"
import { TimezoneViewer } from "./timezone-viewer"
import { UserProfile } from "./user-profile"

export const AppSidebar = () => {
  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <HeaderContent />
      </SidebarHeader>
      <SidebarContent>
        {/* Utility Menu */}
        <SidebarGroup>
          <SidebarMenu>
            <ProjectSwitcher />
            <TimezoneViewer />
          </SidebarMenu>
        </SidebarGroup>

        <AllNavigation />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <UserProfile />
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
