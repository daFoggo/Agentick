import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TEAM_ROLE_CATALOG, getTeamRoleOption } from "@/constants/team-roles"
import { ChevronDown, MoreHorizontal, UserMinus } from "lucide-react"
import { generateColumns } from "@/lib/data-table"
import type { TTeamMember } from "../schemas"
import { useTeamMemberMutations } from "../queries"
import type { CellContext } from "@tanstack/react-table"

const RoleCell = ({ row }: CellContext<TTeamMember, any>) => {
  const member = row.original
  const { updateRole } = useTeamMemberMutations()
  const roleOption = getTeamRoleOption(member.role)

  if (!roleOption) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Badge
          variant={roleOption.variant}
          className={`cursor-pointer transition-colors ${roleOption.className}`}
        >
          <roleOption.icon className="size-3" />
          {roleOption.label}
          <ChevronDown className="size-3 opacity-50" />
        </Badge>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-40">
        <DropdownMenuLabel>Change Role</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {TEAM_ROLE_CATALOG.map((opt) => (
          <DropdownMenuItem
            key={opt.value}
            className="gap-2"
            disabled={member.role === opt.value}
            onClick={() =>
              updateRole.mutate({
                team_id: member.team_id,
                user_id: member.user_id,
                payload: { role: opt.value },
              })
            }
          >
            <opt.icon className="size-4" />
            {opt.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const ActionCell = ({ row }: CellContext<TTeamMember, any>) => {
  const member = row.original
  const { remove } = useTeamMemberMutations()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8">
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          className="text-destructive focus:bg-destructive/10 focus:text-destructive"
          onClick={() =>
            remove.mutate({
              team_id: member.team_id,
              user_id: member.user_id,
            })
          }
        >
          <UserMinus className="size-4" />
          Remove from Team
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const teamMemberColumns = generateColumns<TTeamMember>([
  {
    id: "member",
    label: "Member",
    size: 200,
    cell: ({ row }) => {
      const member = row.original
      return (
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarImage src={member.user?.avatar_url} />
            <AvatarFallback>
              {member.user?.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">{member.user?.name}</span>
            <span className="text-xs text-muted-foreground">
              {member.user?.email}
            </span>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "role",
    label: "Role",
    size: 150,
    cell: RoleCell,
  },
  {
    accessorKey: "joined_at",
    label: "Joined At",
    size: 150,
    cell: ({ getValue }) => {
      const val = getValue() as string
      return (
        <span className="text-sm text-muted-foreground">
          {val ? new Date(val).toLocaleDateString() : "N/A"}
        </span>
      )
    },
  },
  {
    id: "actions",
    label: "Actions",
    size: 60,
    isActionColumn: true,
    cell: ActionCell,
  },
])
