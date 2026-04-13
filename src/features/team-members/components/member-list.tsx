import { useSuspenseQuery } from "@tanstack/react-query"
import { teamMemberQueries, useTeamMemberMutations } from "../queries"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  MoreHorizontal,
  Shield,
  User,
  UserMinus,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react"

interface IMemberListProps {
  teamId: string
}

export const MemberList = ({ teamId }: IMemberListProps) => {
  const { data: members } = useSuspenseQuery(teamMemberQueries.list(teamId))
  const { updateRole, remove } = useTeamMemberMutations()

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "owner":
        return (
          <Badge className="gap-1 border-amber-500/20 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20">
            <ShieldAlert className="size-3" /> Owner
          </Badge>
        )
      case "manager":
        return (
          <Badge className="gap-1 border-indigo-500/20 bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20">
            <ShieldCheck className="size-3" /> Manager
          </Badge>
        )
      case "member":
        return (
          <Badge variant="secondary" className="gap-1">
            <User className="size-3" /> Member
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="gap-1">
            <Shield className="size-3" /> Viewer
          </Badge>
        )
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border/50 bg-background/50">
      <Table>
        <TableHeader className="bg-muted/30">
          <TableRow>
            <TableHead className="w-[300px]">Member</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Joined At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow
              key={member.id}
              className="group transition-colors hover:bg-muted/20"
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="size-10 border-2 border-background shadow-sm">
                    <AvatarImage src={member.user?.avatar_url} />
                    <AvatarFallback className="bg-primary/5 text-xs font-bold text-primary">
                      {member.user?.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium transition-colors group-hover:text-primary">
                      {member.user?.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {member.user?.email}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell>{getRoleBadge(member.role)}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {member.joined_at
                  ? new Date(member.joined_at).toLocaleDateString()
                  : "N/A"}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Manage Roles</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() =>
                        updateRole.mutate({
                          team_id: teamId,
                          user_id: member.user_id,
                          role: "manager",
                        })
                      }
                    >
                      Set as Manager
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        updateRole.mutate({
                          team_id: teamId,
                          user_id: member.user_id,
                          role: "member",
                        })
                      }
                    >
                      Set as Member
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        updateRole.mutate({
                          team_id: teamId,
                          user_id: member.user_id,
                          role: "viewer",
                        })
                      }
                    >
                      Set as Viewer
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                      onClick={() =>
                        remove.mutate({
                          team_id: teamId,
                          user_id: member.user_id,
                        })
                      }
                    >
                      <UserMinus className="mr-2 h-4 w-4" />
                      Remove from Team
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
