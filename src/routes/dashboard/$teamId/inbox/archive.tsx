import { NotificationList, notificationsQueryOptions } from "@/features/inbox"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/dashboard/$teamId/inbox/archive")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(notificationsQueryOptions("ARCHIVED")),
  component: ArchiveInboxView,
})

function ArchiveInboxView() {
  const { data: notifications } = useSuspenseQuery(
    notificationsQueryOptions("ARCHIVED")
  )

  return <NotificationList notifications={notifications} />
}
