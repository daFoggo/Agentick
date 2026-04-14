import { createServerFn } from "@tanstack/react-start"
import { requestLoggerMiddleware } from "@/lib/middleware"
import { z } from "zod"
import {
  AddProjectMemberInputSchema,
  UpdateProjectMemberRoleInputSchema,
  RemoveProjectMemberSchema,
} from "./schemas"
import {
  fetchProjectMembers,
  addProjectMember,
  updateProjectMemberRole,
  removeProjectMember,
} from "./server"

export const getProjectMembersFn = createServerFn({ method: "GET" })
  .middleware([requestLoggerMiddleware])
  .inputValidator(z.object({ projectId: z.string() }))
  .handler(async ({ data }) => {
    return await fetchProjectMembers(data.projectId)
  })

export const addProjectMemberFn = createServerFn({ method: "POST" })
  .middleware([requestLoggerMiddleware])
  .inputValidator(AddProjectMemberInputSchema)
  .handler(async ({ data }) => {
    return await addProjectMember(data)
  })

export const updateProjectMemberRoleFn = createServerFn({ method: "POST" })
  .middleware([requestLoggerMiddleware])
  .inputValidator(UpdateProjectMemberRoleInputSchema)
  .handler(async ({ data }) => {
    return await updateProjectMemberRole(data)
  })

export const removeProjectMemberFn = createServerFn({ method: "POST" })
  .middleware([requestLoggerMiddleware])
  .inputValidator(RemoveProjectMemberSchema)
  .handler(async ({ data }) => {
    return await removeProjectMember(data.projectId, data.user_id)
  })
