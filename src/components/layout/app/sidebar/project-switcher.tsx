import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { ChevronsUpDown, FolderOpen } from "lucide-react"

export const ProjectSwitcher = () => {
  return (
    <SidebarMenuItem>
      <Popover>
        <PopoverTrigger asChild>
          <SidebarMenuButton>
            <div className="rounded-md bg-muted p-1">
              <FolderOpen />
            </div>
            <span className="text-sm font-medium">Project A</span>
            <SidebarMenuBadge>
              <ChevronsUpDown />
            </SidebarMenuBadge>
          </SidebarMenuButton>
        </PopoverTrigger>
        <PopoverContent>
          <PopoverHeader>My Projects</PopoverHeader>
        </PopoverContent>
      </Popover>
    </SidebarMenuItem>
  )
}
