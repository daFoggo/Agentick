import { ViewModeList } from "@/components/layout/app/view-mode-list"
import { INBOX_VIEW_MODE_CATALOG, buildViewModes } from "@/constants/view-mode-list"
import type { TInboxStats } from "@/features/inbox"
import { createFileRoute } from "@tanstack/react-router"
import { inboxStatsQueryOptions } from "@/features/inbox/queries"
import { useSuspenseQuery } from "@tanstack/react-query"

const inboxRenderers = {
  active: () => <div>Inbox active items</div>,
  bookmarks: () => <div>Inbox bookmarked items</div>,
  archive: () => <div>Inbox archived items</div>,
}

const toInboxBadgeMap = (stats: TInboxStats) => ({
  active: stats.activeCount,
  bookmarks: stats.bookmarksCount,
  archive: stats.archiveCount,
})

export const Route = createFileRoute("/dashboard/inbox/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(inboxStatsQueryOptions()),
  component: RouteComponent,
  staticData: {
    header: {
      render: () => <InboxStatsHeader />,
    },
    viewModeScope: "inbox",
    viewModes: buildViewModes(INBOX_VIEW_MODE_CATALOG, inboxRenderers),
    allowViewModeCustomization: false,
  },
})

function RouteComponent() {
  const { data: stats } = useSuspenseQuery(inboxStatsQueryOptions())
  const badgeMap = toInboxBadgeMap(stats)

  const inboxViewModes = buildViewModes(
    INBOX_VIEW_MODE_CATALOG.map((mode) => ({
      ...mode,
      badge: badgeMap[mode.value as keyof typeof badgeMap],
      badgeVariant: "secondary",
    })),
    inboxRenderers
  )

  return (
    <div className="flex flex-col gap-4">
      <ViewModeList
        definitions={inboxViewModes}
        scope="inbox"
        allowCustomization={false}
      />
    </div>
  )
}

function InboxStatsHeader() {
  return (
    <div className="flex justify-between items-center gap-4 w-full">
      <p className="font-semibold text-foreground text-xl">Inbox</p>
    </div>
  )
}
