import { z } from "zod"
import type { TProject } from "../projects"
import type { TTeamMember } from "../team-members"

/**
 * @description Team Schema (Single Source of Truth) - Using snake_case to match Backend
 */
export const TeamSchema = z.object({
  id: z.string(),
  name: z.string().min(2, "Tên team tối thiểu 2 ký tự"),
  description: z.string().optional(),
  avatar_url: z.url().optional().or(z.literal("")),
  owner_id: z.string(),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime().optional(),
})

/**
 * @description Team Types inferred from Zod Schema
 */
export type TTeam = z.infer<typeof TeamSchema> & {
  members?: TTeamMember[]
  projects?: TProject[]
}

export const CreateTeamSchema = TeamSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
})

export const UpdateTeamSchema = CreateTeamSchema.partial()

// Input Schemas for Functions - Using snake_case
export const GetTeamsSchema = z.object({
  name__ilike: z.string().optional(),
  page: z.number().optional(),
  size: z.number().optional(),
}).optional()

export const FetchTeamByIdSchema = z.string()

export const UpdateTeamInputSchema = z.object({
  team_id: z.string(),
  payload: UpdateTeamSchema,
})
