import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MemberAvatarGroup } from "@/components/common/member-avatar-group"
import { Button } from "@/components/ui/button"
import { InviteTeamMemberDialog } from "@/features/team-members"
import type { TTeam } from "@/features/teams"
import type { TTeamMember } from "@/features/team-members"
import { teamMembersQueryOptions } from "@/features/team-members/queries"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { UserPlus, Users } from "lucide-react"

export interface ITeamDetailsHeaderProps {
  team: TTeam | null
}

export function TeamDetailsHeader({ team }: ITeamDetailsHeaderProps) {
  const [inviteOpen, setInviteOpen] = useState(false)
  const { data: membersData } = useQuery({
    ...teamMembersQueryOptions(team?.id ?? ""),
    enabled: !!team?.id,
  })

  if (!team) {
    return (
      <div className="flex w-full items-center justify-between gap-4 py-2 text-destructive">
        Error loading team details
      </div>
    )
  }

  const members = membersData?.founds ?? []

  return (
    <div className="flex w-full items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <div className="rounded-md border bg-muted p-2">
          <Users className="size-4" />
        </div>

        <p className="text-xl font-semibold text-foreground">
          {team.name ?? "Unknown team"}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <MemberAvatarGroup
          items={members}
          max={4}
          size="default"
          getAvatarInfo={(m: TTeamMember) => ({
            id: m.id,
            name: m.user?.name,
            avatar_url: m.user?.avatar_url,
          })}
        />

        <Button onClick={() => setInviteOpen(true)}>
          Invite
          <UserPlus />
        </Button>

        <InviteTeamMemberDialog
          teamId={team.id}
          open={inviteOpen}
          onOpenChange={setInviteOpen}
        />
      </div>
    </div>
  )
}
