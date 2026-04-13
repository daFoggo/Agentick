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
  joined_at: z.string(),
  created_at: z.string().optional(),
  updated_at: z.string().optional().nullable(),
  user: UserSchema.optional(),
})

export type TTeamRole = z.infer<typeof TeamRoleSchema>
export type TTeamMember = z.infer<typeof TeamMemberSchema>

export const FetchTeamMembersSchema = z.string()

export const AddTeamMemberSchema = z.object({
  role: TeamRoleSchema.default("member"),
  user_id: z.string(),
})

export const UpdateTeamMemberRoleSchema = z.object({
  role: TeamRoleSchema,
})

export const AddTeamMemberInputSchema = z.object({
  team_id: z.string(),
  payload: AddTeamMemberSchema,
})

export const UpdateTeamMemberRoleInputSchema = z.object({
  team_id: z.string(),
  user_id: z.string(),
  payload: UpdateTeamMemberRoleSchema,
})

export const RemoveTeamMemberSchema = z.object({
  team_id: z.string(),
  user_id: z.string(),
})

export interface TTeamMemberSearchOptions {
  ordering: string | null
  page: number
  page_size: number
  total_count: number
}

export interface TTeamMembersResponse {
  founds: TTeamMember[]
  search_options: TTeamMemberSearchOptions
}
