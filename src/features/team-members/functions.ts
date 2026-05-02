import { createServerFn } from "@tanstack/react-start"
import { requestLoggerMiddleware } from "@/lib/middleware"
import {
  fetchTeamMembers,
  addTeamMember,
  updateTeamMemberRole,
  removeTeamMember,
  getMemberProjectCount,
  generateTeamInvite,
  acceptTeamInvite,
} from "./server"
import {
  FetchTeamMembersSchema,
  AddTeamMemberInputSchema,
  UpdateTeamMemberRoleInputSchema,
  RemoveTeamMemberSchema,
  TeamInviteGenerateRequestSchema,
  TeamInviteAcceptRequestSchema,
} from "./schemas"
import { z } from "zod"

export const fetchTeamMembersFn = createServerFn({ method: "GET" })
  .middleware([requestLoggerMiddleware])
  .inputValidator(FetchTeamMembersSchema)
  .handler(({ data }) => fetchTeamMembers(data))

export const addTeamMemberFn = createServerFn({ method: "POST" })
  .middleware([requestLoggerMiddleware])
  .inputValidator(AddTeamMemberInputSchema)
  .handler(({ data }) => addTeamMember(data.teamId, data.payload))

export const updateTeamMemberRoleFn = createServerFn({ method: "POST" })
  .middleware([requestLoggerMiddleware])
  .inputValidator(UpdateTeamMemberRoleInputSchema)
  .handler(({ data }) =>
    updateTeamMemberRole(data.teamId, data.user_id, data.payload)
  )

export const removeTeamMemberFn = createServerFn({ method: "POST" })
  .middleware([requestLoggerMiddleware])
  .inputValidator(RemoveTeamMemberSchema)
  .handler(({ data }) => removeTeamMember(data.teamId, data.user_id))

export const getMemberProjectCountFn = createServerFn({ method: "GET" })
  .middleware([requestLoggerMiddleware])
  .inputValidator(RemoveTeamMemberSchema) // Reusing RemoveTeamMemberSchema since it has teamId and user_id
  .handler(({ data }) => getMemberProjectCount(data.teamId, data.user_id))

export const generateTeamInviteFn = createServerFn({ method: "POST" })
  .middleware([requestLoggerMiddleware])
  .inputValidator(z.object({ teamId: z.string(), payload: TeamInviteGenerateRequestSchema }))
  .handler(({ data }) => generateTeamInvite(data.teamId, data.payload))

export const acceptTeamInviteFn = createServerFn({ method: "POST" })
  .middleware([requestLoggerMiddleware])
  .inputValidator(TeamInviteAcceptRequestSchema)
  .handler(({ data }) => acceptTeamInvite(data))
