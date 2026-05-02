import { InboxView, inboxListQueryOptions } from "@/features/inbox"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/dashboard/$teamId/inbox/bookmarks")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(inboxListQueryOptions("BOOKMARKED")),
  component: BookmarkedInboxView,
})

function BookmarkedInboxView() {
  const { data: items } = useSuspenseQuery(
    inboxListQueryOptions("BOOKMARKED")
  )

  return <InboxView items={items} />
}
