import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MemberAvatarGroup } from "@/components/common/member-avatar-group"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  InviteProjectMemberDialog,
  projectMembersQueryOptions,
  type TProjectMember,
} from "@/features/project-members"
import type { TProject } from "@/features/projects"
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { FolderOpen, Settings, Share2 } from "lucide-react"
import { useState } from "react"

export interface IProjectDetailsHeaderProps {
  teamId: string
  project: TProject | null
}

export function ProjectDetailsHeader({
  teamId,
  project,
}: IProjectDetailsHeaderProps) {
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const navigate = useNavigate()
  const { data: membersData } = useQuery({
    ...projectMembersQueryOptions(project?.id ?? ""),
    enabled: !!project?.id,
  })

  if (!project) {
    return (
      <div className="flex w-full items-center justify-between gap-4 py-2 text-destructive font-medium">
        Error loading project details
      </div>
    )
  }

  const members = membersData?.founds ?? []

  return (
    <div className="flex w-full items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <div className="rounded-md border bg-muted p-2">
          <FolderOpen className="size-4" />
        </div>

        <div className="flex items-center gap-2">
          <p className="text-xl font-semibold text-foreground">
            {project.name ?? "Unknown project"}
          </p>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={() =>
                  navigate({
                    to: "/dashboard/$teamId/projects/$projectId/settings",
                    params: { teamId, projectId: project.id },
                  })
                }
              >
                <Settings className="size-4 text-muted-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Settings</TooltipContent>
          </Tooltip>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {members.length > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className="cursor-pointer transition-all"
                onClick={() =>
                  navigate({
                    to: "/dashboard/$teamId/projects/$projectId/settings/members",
                    params: { teamId, projectId: project.id },
                  })
                }
              >
                <MemberAvatarGroup
                  items={members}
                  max={4}
                  size="default"
                  getAvatarInfo={(m: TProjectMember) => ({
                    id: m.id,
                    name: m.user?.name,
                    avatar_url: m.user?.avatar_url,
                  })}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>View all members</TooltipContent>
          </Tooltip>
        )}

        <Button onClick={() => setIsInviteOpen(true)} className="gap-2">
          Share
          <Share2 className="size-4" />
        </Button>
      </div>

      <InviteProjectMemberDialog
        open={isInviteOpen}
        onOpenChange={setIsInviteOpen}
        projectId={project.id}
      />
    </div>
  )
}
