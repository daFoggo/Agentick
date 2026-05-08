import { createServerFn } from "@tanstack/react-start"
import { requestLoggerMiddleware } from "@/lib/middleware"
import {
  GetProjectSchema,
  GetProjectsSchema,
  CreateProjectSchema,
  UpdateProjectSchema,
  StatsPeriodSchema,
} from "./schemas"
import {
  fetchProjects,
  fetchMyProjects,
  fetchProjectById,
  createProject,
  updateProject,
  deleteProject,
  fetchProjectTaskStats,
  fetchProjectMemberWorkload,
  fetchProjectRecentStatusUpdates,
} from "./server"
import { z } from "zod"

export const getProjectsFn = createServerFn({ method: "GET" })
  .middleware([requestLoggerMiddleware])
  .inputValidator(GetProjectsSchema)
  .handler(async ({ data }) => {
    const res = await fetchProjects(data)
    return res ?? []
  })

export const getMyProjectsFn = createServerFn({ method: "GET" })
  .middleware([requestLoggerMiddleware])
  .handler(async () => {
    const res = await fetchMyProjects()
    return res ?? []
  })

export const getProjectByIdFn = createServerFn({ method: "GET" })
  .middleware([requestLoggerMiddleware])
  .inputValidator(GetProjectSchema)
  .handler(async ({ data }) => {
    return await fetchProjectById(data.projectId)
  })

export const createProjectFn = createServerFn({ method: "POST" })
  .middleware([requestLoggerMiddleware])
  .inputValidator(CreateProjectSchema)
  .handler(async ({ data }) => {
    return await createProject(data)
  })

export const updateProjectFn = createServerFn({ method: "POST" })
  .middleware([requestLoggerMiddleware])
  .inputValidator(
    z.object({ projectId: z.string(), payload: UpdateProjectSchema })
  )
  .handler(async ({ data }) => {
    return await updateProject(data.projectId, data.payload)
  })

export const deleteProjectFn = createServerFn({ method: "POST" })
  .middleware([requestLoggerMiddleware])
  .inputValidator(z.string())
  .handler(async ({ data }) => {
    return await deleteProject(data)
  })

export const fetchProjectTaskStatsFn = createServerFn({ method: "GET" })
  .middleware([requestLoggerMiddleware])
  .inputValidator(z.object({ projectId: z.string(), period: StatsPeriodSchema.optional() }))
  .handler(async ({ data }) => {
    return await fetchProjectTaskStats(data.projectId, data.period ?? "weekly")
  })

export const fetchProjectMemberWorkloadFn = createServerFn({ method: "GET" })
  .middleware([requestLoggerMiddleware])
  .inputValidator(z.object({ projectId: z.string(), period: StatsPeriodSchema.optional() }))
  .handler(async ({ data }) => {
    return await fetchProjectMemberWorkload(data.projectId, data.period ?? "weekly")
  })

export const fetchProjectRecentStatusUpdatesFn = createServerFn({ method: "GET" })
  .middleware([requestLoggerMiddleware])
  .inputValidator(z.object({ projectId: z.string(), limit: z.number().optional() }))
  .handler(async ({ data }) => {
    return await fetchProjectRecentStatusUpdates(data.projectId, data.limit ?? 10)
  })
