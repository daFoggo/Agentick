import { ProjectMemberList } from "@/features/project-members"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/dashboard/$teamId/projects/$projectId/members"
)({
  component: ProjectMembersPage,
})

function ProjectMembersPage() {
  const { projectId } = Route.useParams()

  return <ProjectMemberList projectId={projectId} />
}
