import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/dashboard/team/")({
  component: RouteComponent,
  staticData: {
    getTitle: () => "Team",
  },
})

function RouteComponent() {
  return <div>Hello "/dashboard/team/"!</div>
}
