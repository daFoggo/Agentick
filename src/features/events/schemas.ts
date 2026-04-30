import { z } from "zod"
import { ApiDateSchema, FindOrderingSchema, FindPageSchema, FindPageSizeWithAllSchema } from "@/lib/zod-common"
import type { TBaseFindResponse, TBaseSearchOptions } from "@/types/api"

export const EventTypeSchema = z.enum(["task", "meeting", "focus_time", "leave"])
export type TEventType = z.infer<typeof EventTypeSchema>

export const EventSchema = z.object({
  id: z.string(),
  calendar_id: z.string(),
  user_id: z.string(),
  team_id: z.string(),
  type: EventTypeSchema,
  title: z.string().min(1, "Tiêu đề không được để trống"),
  description: z.string().optional().nullable(),
  start_time: ApiDateSchema,
  end_time: ApiDateSchema,
  task_id: z.string().optional().nullable(),
  created_at: ApiDateSchema.optional(),
  updated_at: ApiDateSchema.optional().nullable(),
})

export type TEvent = z.infer<typeof EventSchema>

export const CreateEventBaseSchema = z.object({
  calendar_id: z.string(),
  user_id: z.string(),
  team_id: z.string(),
  type: EventTypeSchema,
  title: z.string().min(1, "Tiêu đề không được để trống"),
  description: z.string().optional(),
  start_time: ApiDateSchema,
  end_time: ApiDateSchema,
  task_id: z.string().optional(),
})

export const CreateEventSchema = CreateEventBaseSchema.refine(
  (data) => {
    if (data.type === "task" && !data.task_id) {
      return false
    }
    return true
  },
  {
    message: "task_id is required when type is task",
    path: ["task_id"],
  }
)

export type TCreateEventInput = z.infer<typeof CreateEventSchema>

export const UpdateEventSchema = CreateEventBaseSchema.partial()

export type TUpdateEventInput = {
  eventId: string
  payload: z.infer<typeof UpdateEventSchema>
}

export const FindEventsSchema = z.object({
  calendar_id__eq: z.string().optional(),
  user_id__eq: z.string().optional(),
  team_id__eq: z.string().optional(),
  type__eq: EventTypeSchema.optional(),
  page: FindPageSchema,
  page_size: FindPageSizeWithAllSchema,
  ordering: FindOrderingSchema,
}).optional()

export type TFindEventsInput = z.infer<typeof FindEventsSchema>

export type TEventsResponse = TBaseFindResponse<
  TEvent,
  TBaseSearchOptions<number | "all", string | null>
>
