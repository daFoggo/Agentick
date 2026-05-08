import { myProjectsQueryOptions, MyProjectsGrid } from "@/features/projects"
import { taskQueries, TaskLine } from "@/features/tasks"
import { userQueries, UserGreeting } from "@/features/users"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/dashboard/$teamId/overview/")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(userQueries.me()),
      context.queryClient.ensureQueryData(userQueries.stats("weekly")),
      context.queryClient.ensureQueryData(taskQueries.myTasks()),
      context.queryClient.ensureQueryData(myProjectsQueryOptions()),
    ])
  },
  component: RouteComponent,
  staticData: {
    getTitle: () => "Overview",
  },
})

function RouteComponent() {
  return (
    <div className="flex w-full flex-col gap-4">
      <UserGreeting />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TaskLine />
        <MyProjectsGrid />
      </div>
    </div>
  )
}
