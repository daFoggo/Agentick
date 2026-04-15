import { z } from "zod"
import {
  ApiDateSchema,
  FindOrderingSchema,
  FindPageSchema,
  FindPageSizeWithAllSchema,
} from "@/lib/zod-common"
import type { TBaseFindResponse, TBaseSearchOptions } from "@/types/api"

const BaseFindOptionsSchema = z.object({
  page: FindPageSchema,
  page_size: FindPageSizeWithAllSchema,
  ordering: FindOrderingSchema,
})

const createFindOptionsSchema = <TShape extends z.ZodRawShape>(shape: TShape) =>
  BaseFindOptionsSchema.extend(shape).optional()

export const TaskStatusSchema = z.object({
  id: z.string(),
  created_at: ApiDateSchema,
  updated_at: ApiDateSchema,
  project_id: z.string(),
  name: z.string().min(1),
  color: z.string(),
  order: z.number(),
  is_default: z.boolean(),
  is_completed: z.boolean(),
})

export const TaskStatusCreateSchema = z.object({
  project_id: z.string().optional(),
  name: z.string().min(1),
  color: z.string(),
  order: z.number().int(),
  is_default: z.boolean().optional(),
  is_completed: z.boolean().optional(),
})

export const TaskStatusUpdateSchema = TaskStatusCreateSchema.omit({
  project_id: true,
})
  .partial()
  .extend({
    is_default: z.boolean().optional(),
    is_completed: z.boolean().optional(),
  })

export const TaskStatusFindSchema = createFindOptionsSchema({
  id__eq: z.string().optional(),
  name__ilike: z.string().optional(),
  is_default__eq: z.boolean().optional(),
  is_completed__eq: z.boolean().optional(),
  level__eq: z.number().int().optional(),
})

export const TaskTypeSchema = z.object({
  id: z.string(),
  created_at: ApiDateSchema,
  updated_at: ApiDateSchema,
  project_id: z.string(),
  name: z.string().min(1),
  color: z.string(),
  icon: z.string(),
  order: z.number(),
  is_default: z.boolean(),
})

export const TaskTypeCreateSchema = z.object({
  project_id: z.string().optional(),
  name: z.string().min(1),
  color: z.string(),
  icon: z.string(),
  order: z.number().int(),
  is_default: z.boolean().optional(),
})

export const TaskTypeUpdateSchema = TaskTypeCreateSchema.omit({
  project_id: true,
}).partial()

export const TaskTypeFindSchema = createFindOptionsSchema({
  id__eq: z.string().optional(),
  name__ilike: z.string().optional(),
  is_default__eq: z.boolean().optional(),
})

export const TaskPrioritySchema = z.object({
  id: z.string(),
  created_at: ApiDateSchema,
  updated_at: ApiDateSchema,
  project_id: z.string(),
  name: z.string().min(1),
  color: z.string(),
  level: z.number().int().min(0).max(3),
  order: z.number(),
  is_default: z.boolean(),
})

export const TaskPriorityCreateSchema = z.object({
  project_id: z.string().optional(),
  name: z.string().min(1),
  color: z.string(),
  level: z.number().int().min(0).max(3),
  order: z.number().int(),
  is_default: z.boolean().optional(),
})

export const TaskPriorityUpdateSchema = TaskPriorityCreateSchema.omit({
  project_id: true,
}).partial()

export const TaskPriorityFindSchema = createFindOptionsSchema({
  id__eq: z.string().optional(),
  name__ilike: z.string().optional(),
  level__eq: z.number().int().optional(),
  is_default__eq: z.boolean().optional(),
})

export const TaskTagSchema = z.object({
  id: z.string(),
  created_at: ApiDateSchema,
  updated_at: ApiDateSchema,
  project_id: z.string(),
  name: z.string().min(1),
  color: z.string(),
})

export const TaskTagCreateSchema = z.object({
  project_id: z.string().optional(),
  name: z.string().min(1),
  color: z.string(),
})

export const TaskTagUpdateSchema = TaskTagCreateSchema.omit({
  project_id: true,
}).partial()

export const TaskTagFindSchema = createFindOptionsSchema({
  id__eq: z.string().optional(),
  name__ilike: z.string().optional(),
})

export type TTaskStatusSearchOptions = TBaseSearchOptions<number | "all", string>
export type TTaskTypeSearchOptions = TBaseSearchOptions<number | "all", string>
export type TTaskPrioritySearchOptions = TBaseSearchOptions<
  number | "all",
  string
>
export type TTaskTagSearchOptions = TBaseSearchOptions<number | "all", string>

export type TTaskStatusesResponse = TBaseFindResponse<
  TTaskStatus,
  TTaskStatusSearchOptions
>
export type TTaskTypesResponse = TBaseFindResponse<TTaskType, TTaskTypeSearchOptions>
export type TTaskPrioritiesResponse = TBaseFindResponse<
  TTaskPriority,
  TTaskPrioritySearchOptions
>
export type TTaskTagsResponse = TBaseFindResponse<TTaskTag, TTaskTagSearchOptions>

export type TTaskStatus = z.infer<typeof TaskStatusSchema>
export type TTaskStatusCreateInput = z.infer<typeof TaskStatusCreateSchema>
export type TTaskStatusUpdateInput = z.infer<typeof TaskStatusUpdateSchema>
export type TTaskStatusFindInput = z.infer<typeof TaskStatusFindSchema>

export type TTaskType = z.infer<typeof TaskTypeSchema>
export type TTaskTypeCreateInput = z.infer<typeof TaskTypeCreateSchema>
export type TTaskTypeUpdateInput = z.infer<typeof TaskTypeUpdateSchema>
export type TTaskTypeFindInput = z.infer<typeof TaskTypeFindSchema>

export type TTaskPriority = z.infer<typeof TaskPrioritySchema>
export type TTaskPriorityCreateInput = z.infer<typeof TaskPriorityCreateSchema>
export type TTaskPriorityUpdateInput = z.infer<typeof TaskPriorityUpdateSchema>
export type TTaskPriorityFindInput = z.infer<typeof TaskPriorityFindSchema>

export type TTaskTag = z.infer<typeof TaskTagSchema>
export type TTaskTagCreateInput = z.infer<typeof TaskTagCreateSchema>
export type TTaskTagUpdateInput = z.infer<typeof TaskTagUpdateSchema>
export type TTaskTagFindInput = z.infer<typeof TaskTagFindSchema>