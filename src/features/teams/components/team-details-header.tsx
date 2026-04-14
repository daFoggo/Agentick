import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import type { TTeamMember } from "@/features/team-members"
import { InviteTeamMemberDialog } from "@/features/team-members"
import { teamQueries } from "@/features/teams"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { UserPlus, Users } from "lucide-react"

export interface ITeamDetailsHeaderProps {
  teamId: string
}

export function TeamDetailsHeader({ teamId }: ITeamDetailsHeaderProps) {
  const [inviteOpen, setInviteOpen] = useState(false)
  const { data: team, isLoading, error } = useQuery(teamQueries.detail(teamId))

  if (isLoading) {
    return (
      <div className="flex w-full items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Skeleton className="size-8 rounded-md" />
          <Skeleton className="h-7 w-48" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
      </div>
    )
  }

  if (error || !team) {
    return (
      <div className="flex w-full items-center justify-between gap-4 py-2 text-destructive">
        Error loading team details
      </div>
    )
  }

  return (
    <div className="flex w-full items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <div className="rounded-md border bg-muted p-2">
          <Users className="size-4" />
        </div>

        <p className="text-xl font-semibold text-foreground">
          {team?.name ?? "Unknown team"}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <AvatarGroup>
          {team?.members?.slice(0, 2).map((member: TTeamMember) => (
            <Avatar key={member.id}>
              <AvatarImage src={member?.user?.avatar_url} />
              <AvatarFallback>{member.user?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
          ))}
          {team?.members && team.members.length > 2 && (
            <AvatarGroupCount>+{team.members.length - 2}</AvatarGroupCount>
          )}
        </AvatarGroup>

        <Button onClick={() => setInviteOpen(true)}>
          Invite
          <UserPlus />
        </Button>

        <InviteTeamMemberDialog
          teamId={teamId}
          open={inviteOpen}
          onOpenChange={setInviteOpen}
        />
      </div>
    </div>
  )
}
