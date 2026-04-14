import { ViewModeList } from "@/components/layout/app/view-mode-list"
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { PROJECT_VIEW_MODE_CATALOG } from "@/constants/view-mode-list"
import {
  InviteProjectMemberDialog,
  type TProjectMember,
} from "@/features/project-members"
import { projectQueryOptions } from "@/features/projects/queries"
import { useQuery } from "@tanstack/react-query"
import { Outlet, createFileRoute, useNavigate } from "@tanstack/react-router"
import { FolderOpen, Settings, Share2 } from "lucide-react"
import { useState } from "react"

export const Route = createFileRoute("/dashboard/$teamId/projects/$projectId")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(projectQueryOptions(params.projectId)),
  component: RouteComponent,
  staticData: {
    header: {
      render: () => <ProjectHeader />,
    },
  },
})

function RouteComponent() {
  const { teamId, projectId } = Route.useParams()

  return (
    <div className="flex flex-col gap-4">
      <ViewModeList
        catalog={PROJECT_VIEW_MODE_CATALOG}
        scope="project"
        params={{ teamId, projectId }}
      />
      <Outlet />
    </div>
  )
}

function ProjectHeader() {
  const { teamId, projectId } = Route.useParams()
  
  // Use useQuery instead of useSuspenseQuery for the header to handle 
  // intermediate states (like undefined ID) more gracefully during hydration
  const { data: project } = useQuery({
    ...projectQueryOptions(projectId || ""),
    enabled: !!projectId,
  })
  
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const navigate = useNavigate()

  // Return a placeholder structure that matches the dimensions to avoid layout shifts
  // but ensures basic elements are consistent
  return (
    <div className="flex w-full items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <div className="rounded-md border bg-muted p-2">
          <FolderOpen className="size-4" />
        </div>

        <div className="flex items-center gap-2">
          <p className="text-xl font-semibold text-foreground">
            {project?.name ?? "Unknown project"}
          </p>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  navigate({
                    to: "/dashboard/$teamId/projects/$projectId/settings",
                    params: { teamId, projectId },
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
        {project?.members && project.members.length > 0 && (
          <AvatarGroup
            className="cursor-pointer transition-all hover:opacity-80 active:scale-95"
            onClick={() =>
              navigate({
                to: "/dashboard/$teamId/projects/$projectId/members",
                params: { teamId, projectId },
              })
            }
          >
            {project.members.slice(0, 4).map((member: TProjectMember) => (
              <Avatar key={member.id} className="border-2 border-background">
                <AvatarImage src={member.user?.avatar_url ?? undefined} />
                <AvatarFallback className="bg-primary/10 text-[10px] font-medium text-primary">
                  {member.user?.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            ))}
            {project.members.length > 4 && (
              <AvatarGroupCount className="border-2 border-background bg-muted text-[10px]">
                +{project.members.length - 4}
              </AvatarGroupCount>
            )}
          </AvatarGroup>
        )}

        <Button onClick={() => setIsInviteOpen(true)} className="gap-2">
          Share
          <Share2 className="size-4" />
        </Button>
      </div>

      <InviteProjectMemberDialog
        open={isInviteOpen}
        onOpenChange={setIsInviteOpen}
        projectId={projectId}
      />
    </div>
  )
}
