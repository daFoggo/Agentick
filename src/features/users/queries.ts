import { queryOptions } from "@tanstack/react-query"
import { fetchUserStatsFn, getUserMeFn, searchUsersFn } from "./functions"
import type { TStatsPeriod } from "./schemas"

/**
 * @description Query options cho tính năng Users
 */
export const userQueries = {
  me: () =>
    queryOptions({
      queryKey: ["users", "me"],
      queryFn: () => getUserMeFn(),
    }),

  search: (
    q: string,
    options?: {
      teamId?: string
      excludeTeamId?: string
      excludeProjectId?: string
    }
  ) =>
    queryOptions({
      queryKey: ["users", "search", q, options],
      queryFn: () =>
        searchUsersFn({
          data: {
            q,
            teamId: options?.teamId,
            excludeTeamId: options?.excludeTeamId,
            excludeProjectId: options?.excludeProjectId,
            limit: 10,
          },
        }),
      enabled: q.length >= 1,
    }),

  stats: (period: TStatsPeriod = "weekly") =>
    queryOptions({
      queryKey: ["users", "stats", period],
      queryFn: () => fetchUserStatsFn({ data: { period } }),
    }),
}
