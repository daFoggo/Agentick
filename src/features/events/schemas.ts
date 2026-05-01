import {
  ApiDateSchema,
  FindOrderingSchema,
  FindPageSchema,
  FindPageSizeWithAllSchema,
} from "@/lib/zod-common"
import type { TBaseFindResponse, TBaseSearchOptions } from "@/types/api"
import { z } from "zod"

export const EventTypeSchema = z.enum(["meeting", "focus_time", "leave", "task"])
export type TEventType = z.infer<typeof EventTypeSchema>

export const EventSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  team_id: z.string(),
  type: EventTypeSchema,
  title: z.string().min(1, "Tiêu đề không được để trống"),
  description: z.string().optional().nullable(),
  start_time: ApiDateSchema,
  end_time: ApiDateSchema,
  participant_ids: z.array(z.string()).optional(),
  created_at: ApiDateSchema.optional(),
  updated_at: ApiDateSchema.optional().nullable(),
})

import { TeamMemberSchema } from "../team-members/schemas"

export type TEvent = z.infer<typeof EventSchema> & {
  participants?: z.infer<typeof TeamMemberSchema>[]
}

export const CreateEventBaseSchema = z.object({
  user_id: z.string(),
  team_id: z.string(),
  type: EventTypeSchema,
  title: z.string().min(1, "Tiêu đề không được để trống"),
  description: z.string().optional(),
  start_time: ApiDateSchema,
  end_time: ApiDateSchema,
  participant_ids: z.array(z.string()).optional(),
})

export const CreateEventSchema = CreateEventBaseSchema.refine(
  (data) => {
    const start = new Date(data.start_time)
    const end = new Date(data.end_time)
    return end > start
  },
  {
    message: "Thời gian kết thúc phải sau thời gian bắt đầu",
    path: ["end_time"],
  }
)

export type TCreateEventInput = z.infer<typeof CreateEventSchema>

export const UpdateEventSchema = CreateEventBaseSchema.partial()

export type TUpdateEventInput = {
  eventId: string
  payload: z.infer<typeof UpdateEventSchema>
}

export const FindEventsSchema = z
  .object({
    user_id__eq: z.string().optional(),
    team_id__eq: z.string().optional(),
    type__eq: EventTypeSchema.optional(),
    page: FindPageSchema,
    page_size: FindPageSizeWithAllSchema,
    ordering: FindOrderingSchema,
  })
  .optional()

export type TFindEventsInput = z.infer<typeof FindEventsSchema>

export type TEventsResponse = TBaseFindResponse<
  TEvent,
  TBaseSearchOptions<number | "all", string | null>
>
