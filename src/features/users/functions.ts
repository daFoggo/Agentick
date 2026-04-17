import { requestLoggerMiddleware } from "@/lib/middleware"
import { createServerFn } from "@tanstack/react-start"
import { SearchUsersInputSchema } from "./schemas"
import { getUserMe, getMyProjects, getMyTeams, searchUsers } from "./server"

export const getUserMeFn = createServerFn({ method: "GET" })
  .middleware([requestLoggerMiddleware])
  .handler(() => getUserMe())

export const searchUsersFn = createServerFn({ method: "GET" })
  .middleware([requestLoggerMiddleware])
  .inputValidator(SearchUsersInputSchema)
  .handler(({ data }) => searchUsers(data))

export const getMyTeamsFn = createServerFn({ method: "GET" })
  .middleware([requestLoggerMiddleware])
  .handler(() => getMyTeams())

export const getMyProjectsFn = createServerFn({ method: "GET" })
  .middleware([requestLoggerMiddleware])
  .handler(() => getMyProjects())


