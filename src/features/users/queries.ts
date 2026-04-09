import { queryOptions } from "@tanstack/react-query"
import { getUserMeFn } from "./functions"

/**
 * @description Query options cho tính năng Users
 */
export const userQueries = {
  me: () =>
    queryOptions({
      queryKey: ["users", "me"],
      queryFn: () => getUserMeFn(),
    }),
}
