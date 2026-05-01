import { z } from "zod"

export const NotificationStatusSchema = z.enum(["ACTIVE", "ARCHIVED", "DELETED"])
export type TNotificationStatus = z.infer<typeof NotificationStatusSchema>

export const NotificationTypeSchema = z.enum(["SYSTEM", "INVITATION", "TASK_ASSIGNED", "PROJECT_UPDATE"])
export type TNotificationType = z.infer<typeof NotificationTypeSchema>

export const NotificationSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  title: z.string(),
  content: z.string().nullish(),
  type: NotificationTypeSchema,
  status: NotificationStatusSchema,
  is_read: z.boolean(),
  is_bookmarked: z.boolean(),
  resource_id: z.string().nullish(),
  resource_type: z.string().nullish(),
  data: z.record(z.string(), z.any()).nullish(),
  created_at: z.string(),
  updated_at: z.string(),
})

export type TNotification = z.infer<typeof NotificationSchema>

export const InboxStatsSchema = z.object({
  active_count: z.number(),
  unread_count: z.number(),
  bookmarks_count: z.number(),
  archive_count: z.number(),
})

export type TInboxStats = z.infer<typeof InboxStatsSchema>

export const GetInboxStatsSchema = z.object({})
export type GetInboxStatsInput = z.infer<typeof GetInboxStatsSchema>
