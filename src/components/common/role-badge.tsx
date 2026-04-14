import { Badge } from "@/components/ui/badge"
import { getTeamRoleOption } from "@/constants/team-roles"
import type { TTeamRole } from "@/features/team-members/schemas"

interface IRoleBadgeProps {
  role: TTeamRole
  className?: string
}

/**
 * @description Badge hiển thị role — dùng được ở bất kỳ đâu
 */
export function RoleBadge({ role, className }: IRoleBadgeProps) {
  const option = getTeamRoleOption(role)
  if (!option) return null

  return (
    <Badge
      variant={option.variant}
      className={`${option.className} ${className ?? ""}`}
    >
      <option.icon className="size-3" />
      {option.label}
    </Badge>
  )
}
