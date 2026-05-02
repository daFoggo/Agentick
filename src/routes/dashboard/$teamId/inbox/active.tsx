import { InboxView, inboxListQueryOptions } from "@/features/inbox"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/dashboard/$teamId/inbox/active")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(inboxListQueryOptions("ACTIVE")),
  component: ActiveInboxView,
})

function ActiveInboxView() {
  const { data: items } = useSuspenseQuery(
    inboxListQueryOptions("ACTIVE")
  )

  return <InboxView items={items} />
}


