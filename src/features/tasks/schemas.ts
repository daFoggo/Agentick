import { z } from "zod"
import type { TProjectMember } from "../project-members"
import {
  TASK_PRIORITY_CATALOG,
  TASK_STATUS_CATALOG,
  TASK_TYPE_CATALOG,
} from "./constants"

/**
 * @description Task Enums from Constants
 */
export const TaskTypeSchema = z.enum(
  TASK_TYPE_CATALOG.map((i) => i.value) as [string, ...string[]],
)
export const TaskStatusSchema = z.enum(
  TASK_STATUS_CATALOG.map((i) => i.value) as [string, ...string[]],
)
export const TaskPrioritySchema = z.enum(
  TASK_PRIORITY_CATALOG.map((i) => i.value) as [string, ...string[]],
)

/**
 * @description Tag Schema
 */
export const TagSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string(),
  teamId: z.string(),
  createdAt: z.string().datetime().or(z.date()),
})

/**
 * @description Phase Schema
 */
export const PhaseSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  name: z.string(),
  order: z.number(),
  startDate: z.string().datetime().optional().or(z.date()),
  endDate: z.string().datetime().optional().or(z.date()),
  createdAt: z.string().datetime().or(z.date()),
})

/**
 * @description Task Schema (Single Source of Truth)
 */
export const TaskSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  title: z.string().min(1, "Tiêu đề không được để trống"),
  description: z.string().optional(),
  type: TaskTypeSchema,
  status: TaskStatusSchema,
  priority: TaskPrioritySchema,
  phaseId: z.string().optional(),
  assigneeId: z.string().optional(),
  startDate: z.string().datetime().optional().or(z.date()),
  dueDate: z.string().datetime().optional().or(z.date()),
  estimatedHours: z.number().optional(),
  actualHours: z.number().optional(),
  createdAt: z.string().datetime().or(z.date()),
  updatedAt: z.string().datetime().or(z.date()),
})

/**
 * @description Task Types with Relations
 */
export type TTask = z.infer<typeof TaskSchema> & {
  tags?: TTag[]
  phase?: TPhase
  assignee?: TProjectMember
}

export type TTag = z.infer<typeof TagSchema>
export type TPhase = z.infer<typeof PhaseSchema>

export const CreateTaskSchema = TaskSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export const UpdateTaskSchema = CreateTaskSchema.partial()
