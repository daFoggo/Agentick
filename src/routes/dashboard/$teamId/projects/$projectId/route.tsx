import { ViewModeList } from "@/components/layout/app/view-mode-list"
import { PROJECT_VIEW_MODE_CATALOG } from "@/constants/view-mode-list"
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import type { TProjectMember } from "@/features/project-members"
import { projectQueryOptions } from "@/features/projects/queries"
import { useSuspenseQuery } from "@tanstack/react-query"
import { Outlet, createFileRoute } from "@tanstack/react-router"
import { FolderOpen, Share2 } from "lucide-react"

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
  const { projectId } = Route.useParams()
  const { data: project } = useSuspenseQuery(projectQueryOptions(projectId))

  return (
    <div className="flex w-full items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <div className="rounded-md border bg-muted p-2">
          <FolderOpen className="size-4" />
        </div>

        <p className="text-xl font-semibold text-foreground">
          {project?.name ?? "Unknown project"}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <AvatarGroup>
          {project?.members?.slice(0, 2).map((member: TProjectMember) => (
            <Avatar key={member.id}>
              <AvatarImage src={member?.user?.avatar_url} />
              <AvatarFallback>{member.user?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
          ))}
          {project?.members && project.members.length > 2 && (
            <AvatarGroupCount>+{project.members.length - 2}</AvatarGroupCount>
          )}
        </AvatarGroup>

        <Button>
          Share
          <Share2 />
        </Button>
      </div>
    </div>
  )
}
