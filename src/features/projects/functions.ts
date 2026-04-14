import { createServerFn } from "@tanstack/react-start"
import { requestLoggerMiddleware } from "@/lib/middleware"
import {
  GetProjectSchema,
  GetProjectsSchema,
  CreateProjectSchema,
  UpdateProjectSchema,
} from "./schemas"
import {
  fetchProjects,
  fetchMyProjects,
  fetchProjectById,
  createProject,
  updateProject,
  deleteProject,
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
