import { NotificationList, notificationsQueryOptions } from "@/features/inbox"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/dashboard/$teamId/inbox/bookmarks")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(notificationsQueryOptions("ACTIVE", true)),
  component: BookmarksInboxView,
})

function BookmarksInboxView() {
  const { data: notifications } = useSuspenseQuery(
    notificationsQueryOptions("ACTIVE", true)
  )

  return <NotificationList notifications={notifications} />
}
