import { NotificationList, notificationsQueryOptions } from "@/features/inbox"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/dashboard/$teamId/inbox/active")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(notificationsQueryOptions("ACTIVE", false)),
  component: ActiveInboxView,
})

function ActiveInboxView() {
  const { data: notifications } = useSuspenseQuery(
    notificationsQueryOptions("ACTIVE", false)
  )

  return <NotificationList notifications={notifications} />
}
