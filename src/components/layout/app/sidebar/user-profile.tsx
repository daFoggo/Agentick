import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { useSuspenseQuery } from "@tanstack/react-query"
import { userQueries } from "@/features/users"

export const UserProfile = () => {
  const { data: user } = useSuspenseQuery(userQueries.me())

  const initials = user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "??"

  return (
    <SidebarMenuItem>
      <SidebarMenuButton>
        <Avatar size="sm">
          {user?.avatarUrl && (
            <AvatarImage src={user.avatarUrl} alt={user.name} />
          )}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-start text-sm leading-tight">
          <span className="font-semibold truncate max-w-[150px]">
            {user?.name}
          </span>
          <span className="text-xs text-muted-foreground truncate max-w-[150px]">
            {user?.email}
          </span>
        </div>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}
