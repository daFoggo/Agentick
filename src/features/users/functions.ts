import { requestLoggerMiddleware } from "@/lib/middleware"
import { createServerFn } from "@tanstack/react-start"
import { getUserMe } from "./server"

export const getUserMeFn = createServerFn({ method: "POST" })
  .middleware([requestLoggerMiddleware])
  .handler(() => getUserMe())
