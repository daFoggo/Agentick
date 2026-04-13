import { createServerFn } from "@tanstack/react-start"
import { requestLoggerMiddleware } from "@/lib/middleware"
import {
  fetchTeamMembers,
  addTeamMember,
  updateTeamMemberRole,
  removeTeamMember,
} from "./server"
import {
  FetchTeamMembersSchema,
  AddTeamMemberSchema,
  UpdateTeamMemberRoleSchema,
  RemoveTeamMemberSchema,
} from "./schemas"

export const fetchTeamMembersFn = createServerFn({ method: "GET" })
  .middleware([requestLoggerMiddleware])
  .inputValidator(FetchTeamMembersSchema)
  .handler(({ data: team_id }) => fetchTeamMembers(team_id))

export const addTeamMemberFn = createServerFn({ method: "POST" })
  .middleware([requestLoggerMiddleware])
  .inputValidator(AddTeamMemberSchema)
  .handler(({ data }) => addTeamMember(data.team_id, data.user_id, data.role))

export const updateTeamMemberRoleFn = createServerFn({ method: "POST" })
  .middleware([requestLoggerMiddleware])
  .inputValidator(UpdateTeamMemberRoleSchema)
  .handler(({ data }) =>
    updateTeamMemberRole(data.team_id, data.user_id, data.role)
  )

export const removeTeamMemberFn = createServerFn({ method: "POST" })
  .middleware([requestLoggerMiddleware])
  .inputValidator(RemoveTeamMemberSchema)
  .handler(({ data }) => removeTeamMember(data.team_id, data.user_id))
