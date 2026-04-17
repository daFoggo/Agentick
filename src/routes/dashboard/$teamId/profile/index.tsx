import { ProfilePage } from "@/features/users"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/dashboard/$teamId/profile/")({
  component: ProfilePage,
})
