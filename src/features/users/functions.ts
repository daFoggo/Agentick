import { requestLoggerMiddleware } from "@/lib/middleware"
import { createServerFn } from "@tanstack/react-start"
import { SearchUsersInputSchema } from "./schemas"
import { getUserMe, searchUsers } from "./server"

export const getUserMeFn = createServerFn({ method: "POST" })
  .middleware([requestLoggerMiddleware])
  .handler(() => getUserMe())

export const searchUsersFn = createServerFn({ method: "GET" })
  .middleware([requestLoggerMiddleware])
  .inputValidator(SearchUsersInputSchema)
  .handler(({ data }) => searchUsers(data))
