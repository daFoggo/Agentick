import { z } from "zod"
import type { TProjectMember } from "../project-members"
import {
  ApiDateSchema,
  FindOrderingSchema,
  FindPageSchema,
  FindPageSizeWithAllSchema,
} from "@/lib/zod-common"
import type { TBaseFindResponse, TBaseSearchOptions } from "@/types/api"
import {
  TASK_PRIORITY_CATALOG,
  TASK_STATUS_CATALOG,
  TASK_TYPE_CATALOG,
} from "./constants"

export const TaskTypeSchema = z.enum(
  TASK_TYPE_CATALOG.map((i) => i.value) as [string, ...string[]]
)
export const TaskStatusSchema = z.enum(
  TASK_STATUS_CATALOG.map((i) => i.value) as [string, ...string[]]
)
export const TaskPrioritySchema = z.enum(
  TASK_PRIORITY_CATALOG.map((i) => i.value) as [string, ...string[]]
)

export const TagSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string(),
  team_id: z.string(),
  created_at: ApiDateSchema,
})

export const PhaseSchema = z.object({
  id: z.string(),
  project_id: z.string(),
  name: z.string(),
  order: z.number(),
  start_date: ApiDateSchema.optional(),
  end_date: ApiDateSchema.optional(),
  created_at: ApiDateSchema,
})

export const TaskSchema = z.object({
  id: z.string(),
  project_id: z.string(),
  title: z.string().min(1, "Tiêu đề không được để trống"),
  description: z.string().optional(),
  type: TaskTypeSchema,
  status: TaskStatusSchema,
  priority: TaskPrioritySchema,
  phase_id: z.string().optional(),
  assignee_id: z.string().optional(),
  start_date: ApiDateSchema.optional(),
  due_date: ApiDateSchema.optional(),
  estimated_hours: z.number().optional(),
  actual_hours: z.number().optional(),
  created_at: ApiDateSchema,
  updated_at: ApiDateSchema,
})

export const CreateTaskSchema = TaskSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
})

export const UpdateTaskSchema = CreateTaskSchema.partial()

export type TTask = z.infer<typeof TaskSchema> & {
  tags?: TTag[]
  phase?: TPhase
  assignee?: TProjectMember
}

export type TTag = z.infer<typeof TagSchema>
export type TPhase = z.infer<typeof PhaseSchema>

export const ProjectTaskSchema = z.object({
  id: z.string(),
  created_at: ApiDateSchema,
  updated_at: ApiDateSchema,
  project_id: z.string(),
  parent_id: z.string().nullable(),
  title: z.string().min(1, "Tiêu đề không được để trống"),
  description: z.string().optional().nullable(),
  status_id: z.string(),
  type_id: z.string(),
  priority_id: z.string(),
  assigner_id: z.string(),
  assignee_id: z.string().nullable(),
  phase_id: z.string().nullable(),
  start_date: ApiDateSchema,
  due_date: ApiDateSchema,
  order: z.number(),
  is_archived: z.boolean(),
  is_deleted: z.boolean(),
})

export const ProjectTaskCreateSchema = z.object({
  project_id: z.string().optional(),
  parent_id: z.string().nullable().optional(),
  title: z.string().min(1, "Tiêu đề không được để trống"),
  description: z.string().optional().nullable(),
  status_id: z.string(),
  type_id: z.string(),
  priority_id: z.string(),
  assigner_id: z.string(),
  assignee_id: z.string().nullable().optional(),
  phase_id: z.string().nullable().optional(),
  start_date: ApiDateSchema,
  due_date: ApiDateSchema,
  order: z.number().int(),
})

export const ProjectTaskUpdateSchema = ProjectTaskCreateSchema.omit({
  project_id: true,
})
  .partial()
  .extend({
    is_archived: z.boolean().optional(),
  })

export const ProjectTaskFindSchema = z
  .object({
    id__eq: z.string().optional(),
    title__ilike: z.string().optional(),
    status_id__eq: z.string().optional(),
    assignee_id__eq: z.string().optional(),
    is_archived__eq: z.boolean().optional(),
    is_deleted__eq: z.boolean().optional(),
    page: FindPageSchema,
    page_size: FindPageSizeWithAllSchema,
    ordering: FindOrderingSchema,
  })
  .optional()

export const ProjectTaskSearchOptionsSchema = z.object({
  page: z.number(),
  page_size: z.union([z.number(), z.literal("all")]),
  ordering: z.string(),
  total_count: z.number(),
})

export type TProjectTaskSearchOptions = TBaseSearchOptions<number | "all", string>

export type TProjectTasksResponse = TBaseFindResponse<
  TProjectTask,
  TProjectTaskSearchOptions
>

export type TProjectTask = z.infer<typeof ProjectTaskSchema>
export type TProjectTaskCreateInput = z.infer<typeof ProjectTaskCreateSchema>
export type TProjectTaskUpdateInput = z.infer<typeof ProjectTaskUpdateSchema>
export type TProjectTaskFindInput = z.infer<typeof ProjectTaskFindSchema>
