import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"

export const UserProfile = () => {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton>
        <Avatar size="sm">
          <AvatarImage src="https://api.dicebear.com/9.x/lorelei/svg?seed=daFoggo" />
          <AvatarFallback>DF</AvatarFallback>
        </Avatar>
        daFoggo
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}
