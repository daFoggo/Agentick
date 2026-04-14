import { queryOptions } from "@tanstack/react-query"
import { getUserMeFn, searchUsersFn } from "./functions"

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
}
