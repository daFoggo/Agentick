import { z } from "zod"
import type { TProjectMember } from "../project-members"
import type { TTask } from "../tasks"
import type { TBaseFindResponse, TBaseSearchOptions } from "@/types/api"

export const ProjectSchema = z.object({
  id: z.string(),
  team_id: z.string(),
  name: z.string().min(3, "Tên dự án tối thiểu 3 ký tự").max(255),
  description: z.string().max(512).optional().nullable(),
  avatar_url: z.string().url().optional().nullable(),
  is_deleted: z.boolean().default(false),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime().optional().nullable(),
})

export const CreateProjectSchema = z.object({
  team_id: z.string(),
  name: z.string().min(3, "Tên dự án tối thiểu 3 ký tự").max(255),
  description: z.string().max(512).optional(),
  avatar_url: z.string().url().optional(),
})

export const UpdateProjectSchema = CreateProjectSchema.omit({
  team_id: true,
}).partial()

export const GetProjectsSchema = z
  .object({
    team_id__eq: z.string().optional(),
    name__ilike: z.string().optional(),
    id__eq: z.string().optional(),
    is_deleted__eq: z.boolean().optional(),
    page: z.number().optional(),
    page_size: z.number().optional(),
    ordering: z.string().optional(),
  })
  .optional()

export const GetProjectSchema = z.object({
  projectId: z.string(),
})

export type TProjectSearchOptions = TBaseSearchOptions<number, string>

export type TProjectsResponse = TBaseFindResponse<TProject, TProjectSearchOptions>

export type TProject = z.infer<typeof ProjectSchema> & {
  members?: TProjectMember[]
  tasks?: TTask[]
}

export type TGetProjectInput = z.infer<typeof GetProjectSchema>
export type TGetProjectsInput = z.infer<typeof GetProjectsSchema>
export type TCreateProjectInput = z.infer<typeof CreateProjectSchema>
export type TUpdateProjectInput = z.infer<typeof UpdateProjectSchema>
