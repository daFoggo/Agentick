import { ViewModeList } from "@/components/layout/app/view-mode-list"
import { INBOX_VIEW_MODE_CATALOG } from "@/constants/view-mode-list"
import type { TInboxStats } from "@/features/inbox"
import { inboxStatsQueryOptions } from "@/features/inbox/queries"
import { useSuspenseQuery } from "@tanstack/react-query"
import { Outlet, createFileRoute } from "@tanstack/react-router"

const toInboxBadgeMap = (stats: TInboxStats) => ({
  active: stats.activeCount,
  bookmarks: stats.bookmarksCount,
  archive: stats.archiveCount,
})

export const Route = createFileRoute("/dashboard/$teamId/inbox")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(inboxStatsQueryOptions()),
  component: RouteComponent,
  staticData: {
    header: {
      render: () => <InboxStatsHeader />,
    },
  },
})

function RouteComponent() {
  const { teamId } = Route.useParams()
  const { data: stats } = useSuspenseQuery(inboxStatsQueryOptions())
  const badgeMap = toInboxBadgeMap(stats)

  return (
    <div className="flex flex-col gap-4">
      <ViewModeList
        catalog={INBOX_VIEW_MODE_CATALOG}
        scope="inbox"
        params={{ teamId }}
        badgeMap={badgeMap}
        allowCustomization={false}
      />
      <Outlet />
    </div>
  )
}

function InboxStatsHeader() {
  return (
    <div className="flex w-full items-center justify-between gap-4">
      <p className="text-xl font-semibold text-foreground">Inbox</p>
    </div>
  )
}
