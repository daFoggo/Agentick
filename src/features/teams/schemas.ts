import { z } from "zod"
import type { TProject } from "../projects"
import type { TTeamMember } from "../team-members"

export const TeamSchema = z.object({
  id: z.string(),
  name: z.string().min(2, "Tên team tối thiểu 2 ký tự"),
  description: z.string().optional().nullable(),
  avatar_url: z.string().optional().nullable(),
  owner_id: z.string(),
  is_deleted: z.boolean().default(false),
  created_at: z.string(),
  updated_at: z.string().optional().nullable(),
})

export type TTeam = z.infer<typeof TeamSchema> & {
  members?: TTeamMember[]
  projects?: TProject[]
}

export const CreateTeamSchema = z.object({
  name: z.string().min(2, "Tên team tối thiểu 2 ký tự"),
  description: z.string().optional(),
  avatar_url: z.string().optional(),
})

export const UpdateTeamSchema = CreateTeamSchema.partial()

export const GetTeamsSchema = z
  .object({
    ordering: z.string().optional(),
    page: z.number().optional(),
    page_size: z.number().optional(),
    id__eq: z.string().optional(),
    name__ilike: z.string().optional(),
    owner_id__eq: z.string().optional(),
    is_deleted__eq: z.boolean().optional(),
  })
  .optional()

export const FetchTeamByIdSchema = z.string()

export const UpdateTeamInputSchema = z.object({
  team_id: z.string(),
  payload: UpdateTeamSchema,
})

export interface TTeamSearchOptions {
  ordering: string | null
  page: number
  page_size: number
  total_count: number
}

export interface TTeamsResponse {
  founds: TTeam[]
  search_options: TTeamSearchOptions
}
