import { createServerFn } from "@tanstack/react-start"
import { requestLoggerMiddleware } from "@/lib/middleware"
import { GetProjectSchema, GetProjectsSchema } from "./schemas"
import { fetchProjects, fetchProjectById } from "./server"

export const getProjectsFn = createServerFn({ method: "GET" })
  .middleware([requestLoggerMiddleware])
  .inputValidator(GetProjectsSchema)
  .handler(async ({ data }) => {
    const res = await fetchProjects(data)
    return res.data
  })

export const getProjectByIdFn = createServerFn({ method: "GET" })
  .middleware([requestLoggerMiddleware])
  .inputValidator(GetProjectSchema)
  .handler(async ({ data }) => {
    const res = await fetchProjectById(data.projectId)
    return res.data
  })
