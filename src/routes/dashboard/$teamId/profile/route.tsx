import { createFileRoute, Outlet } from "@tanstack/react-router"

export const Route = createFileRoute("/dashboard/$teamId/profile")({
  component: RouteComponent,
  staticData: {
    getTitle: () => "My Profile",
  },
})

function RouteComponent() {
  return <Outlet />
}
