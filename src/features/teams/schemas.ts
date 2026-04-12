import { z } from "zod"
import type { TProject } from "../projects"
import type { TTeamMember } from "../team-members"

/**
 * @description Team Schema (Single Source of Truth)
 */
export const TeamSchema = z.object({
  id: z.string(),
  name: z.string().min(2, "Tên team tối thiểu 2 ký tự"),
  description: z.string().optional(),
  avatarUrl: z.string().url().optional().or(z.literal("")),
  ownerId: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
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
  createdAt: true,
  updatedAt: true,
})

export const UpdateTeamSchema = CreateTeamSchema.partial()
