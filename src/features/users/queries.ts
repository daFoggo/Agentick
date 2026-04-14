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

  search: (q: string, teamId?: string) =>
    queryOptions({
      queryKey: ["users", "search", q, teamId],
      queryFn: () => searchUsersFn({ data: { q, team_id: teamId, limit: 10 } }),
      enabled: q.length >= 1,
    }),
}
