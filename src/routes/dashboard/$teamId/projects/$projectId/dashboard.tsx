// project data fetching intentionally omitted here; components use mocks for now
import {
  ProjectAISummary,
  ProjectStatusUpdate,
  ProjectTaskStatsCard,
  ProjectWorkload,
} from "@/features/projects"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/dashboard/$teamId/projects/$projectId/dashboard"
)({
  component: ProjectDashboardView,
})

function ProjectDashboardView() {
  const { projectId } = Route.useParams()

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-5 auto-rows-max">
      <div className="grid gap-4 lg:col-span-3">
        <ProjectTaskStatsCard />
        <ProjectWorkload />
      </div>
      <div className="flex flex-col gap-4 lg:col-span-2">
        <ProjectAISummary projectId={projectId} />
        <ProjectStatusUpdate />
      </div>
    </div>
  )
}
