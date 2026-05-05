import { MyProjectsGrid } from "@/features/projects"
import { TaskLine } from "@/features/tasks"
import { UserGreeting } from "@/features/users"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/dashboard/$teamId/overview/")({
  component: RouteComponent,
  staticData: {
    getTitle: () => "Overview",
  },
})

function RouteComponent() {
  return (
    <div className="flex w-full flex-col gap-6">
      <UserGreeting />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TaskLine />
        <MyProjectsGrid />
      </div>
    </div>
  )
}
