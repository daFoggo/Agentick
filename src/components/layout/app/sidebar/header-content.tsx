import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { SITE_CONFIG } from "@/configs/site"
import { Link } from "@tanstack/react-router"
import { Sticker } from "lucide-react"

export const HeaderContent = () => {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Link to="/dashboard">
          <SidebarMenuButton>
            <Sticker className="size-5!" />
            <span className="text-lg font-semibold">
              {SITE_CONFIG.app.title}
            </span>
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
