import { z } from "zod"
import { UserSchema } from "../users"

/**
 * @description Team Role Schema
 */
export const TeamRoleSchema = z.enum(["owner", "manager", "member", "viewer"])

/**
 * @description Team Member Schema - Using snake_case to match Backend
 */
export const TeamMemberSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  team_id: z.string(),
  role: TeamRoleSchema,
  joined_at: z.iso.datetime().optional(),
  user: UserSchema.optional(),
})

export type TTeamRole = z.infer<typeof TeamRoleSchema>
export type TTeamMember = z.infer<typeof TeamMemberSchema>

// Input Schemas for Functions - Using snake_case
export const FetchTeamMembersSchema = z.string()

export const AddTeamMemberSchema = z.object({
  team_id: z.string(),
  user_id: z.string(),
  role: TeamRoleSchema,
})

export const UpdateTeamMemberRoleSchema = z.object({
  team_id: z.string(),
  user_id: z.string(),
  role: TeamRoleSchema,
})

export const RemoveTeamMemberSchema = z.object({
  team_id: z.string(),
  user_id: z.string(),
})
