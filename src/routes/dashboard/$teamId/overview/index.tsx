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
        {/* Placeholder for Project list/Upcoming events */}
        <div className="h-full rounded-xl border border-dashed border-muted-foreground/20 bg-muted/5 p-12 text-center text-muted-foreground">
          Projects and Events coming soon...
        </div>
      </div>
    </div>
  )
}
