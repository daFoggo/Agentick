import { ViewModeList } from "@/components/layout/app/view-mode-list"
import {
  PROJECT_VIEW_MODE_CATALOG,
  buildViewModes,
} from "@/constants/view-mode-list"
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
import { SAMPLE_TASKS, TaskTable } from "@/features/tasks"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { FolderOpen, Share2 } from "lucide-react"

export const Route = createFileRoute("/dashboard/projects/$projectId")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(projectQueryOptions(params.projectId)),
  component: RouteComponent,
  staticData: {
    header: {
      render: () => <ProjectHeader />,
    },
    viewModeScope: "project",
    viewModes: buildViewModes(PROJECT_VIEW_MODE_CATALOG, {
      dashboard: () => <ProjectDashboardView />,
      list: () => <ProjectListView />,
      board: () => <ProjectBoardView />,
      timeline: () => <ProjectTimelineView />,
    }),
  },
})

function RouteComponent() {
  return (
    <div className="flex flex-col gap-4">
      <ViewModeList />
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
              <AvatarImage src={member?.user?.avatarUrl} />
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

function ProjectDashboardView() {
  const { projectId } = Route.useParams()
  return <div>Project dashboard: {projectId}</div>
}

function ProjectListView() {
  return <TaskTable data={SAMPLE_TASKS} groupBy="status" />
}

function ProjectBoardView() {
  const { projectId } = Route.useParams()
  return <div>Project board: {projectId}</div>
}

function ProjectTimelineView() {
  const { projectId } = Route.useParams()
  return <div>Project timeline: {projectId}</div>
}
