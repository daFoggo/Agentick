import { queryOptions } from "@tanstack/react-query"
import { getInboxStatsFn, getNotificationsFn } from "./functions"
import type { GetInboxStatsInput, TInboxStats, TNotification, TNotificationStatus } from "./schemas"

export const inboxKeys = {
  all: ["inbox"] as const,
  stats: () => [...inboxKeys.all, "stats"] as const,
  list: (status?: TNotificationStatus, isRead?: boolean, isBookmarked?: boolean) => [...inboxKeys.all, "list", status, isRead, isBookmarked] as const,
}

export const inboxStatsQueryOptions = (params: GetInboxStatsInput = {}) =>
  queryOptions({
    queryKey: inboxKeys.stats(),
    queryFn: () => getInboxStatsFn({ data: params }) as Promise<TInboxStats>,
    staleTime: 1000 * 60 * 2, // 2 minutes
  })

export const notificationsQueryOptions = (status?: TNotificationStatus, isRead?: boolean, isBookmarked?: boolean) =>
  queryOptions({
    queryKey: inboxKeys.list(status, isRead, isBookmarked),
    queryFn: () => getNotificationsFn({ data: { status, isRead, isBookmarked } }) as Promise<TNotification[]>,
    staleTime: 1000 * 30, // 30 seconds
  })
