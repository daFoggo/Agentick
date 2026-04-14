import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/dashboard/$teamId/projects/$projectId/settings"
)({
  component: ProjectSettingsPage,
})

function ProjectSettingsPage() {
  return <div></div>
}
