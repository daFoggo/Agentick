import { z } from "zod"
import type { IProjectMember } from "../project-members"
import type { ITask } from "../tasks"

/**
 * @description Project Schema & Type
 */
export const ProjectSchema = z.object({
  id: z.string(),
  teamId: z.string(),
  name: z.string().min(3),
  description: z.string().optional(),
  avatarUrl: z.url().optional(),
  createdAt: z.iso.datetime().optional(),
  
  // Relations (Dùng any hoặc define cụ thể nếu muốn, ở đây tạm dùng type cũ để tương thích)
  members: z.custom<IProjectMember[]>().optional(),
  tasks: z.custom<ITask[]>().optional(),
})

export type TProject = z.infer<typeof ProjectSchema>

/**
 * @description Inputs for Project operations
 */
export const GetProjectSchema = z.object({
  projectId: z.string(),
})

export const GetProjectsSchema = z.object({
  teamId: z.string().optional(),
})

export type TGetProjectInput = z.infer<typeof GetProjectSchema>
export type TGetProjectsInput = z.infer<typeof GetProjectsSchema>

