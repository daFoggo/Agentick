import { createServerFn } from "@tanstack/react-start"
import { GetInboxStatsSchema } from "./schemas"
import { 
  fetchInboxStats, 
  fetchNotifications, 
  markAsRead, 
  archiveNotification, 
  unarchiveNotification,
  toggleBookmark,
  deleteNotification 
} from "./server"
import { z } from "zod"

export const getInboxStatsFn = createServerFn({ method: "GET" })
  .inputValidator(GetInboxStatsSchema)
  .handler(({ data }) => fetchInboxStats())

export const getNotificationsFn = createServerFn({ method: "GET" })
  .inputValidator(z.object({ 
    status: z.enum(["ACTIVE", "ARCHIVED", "DELETED"]).optional(),
    isRead: z.boolean().optional(),
    isBookmarked: z.boolean().optional()
  }))
  .handler(({ data }) => fetchNotifications(data.status, data.isRead, data.isBookmarked))

export const toggleBookmarkFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ notificationId: z.string() }))
  .handler(({ data }) => toggleBookmark(data.notificationId))

export const markAsReadFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ notificationId: z.string() }))
  .handler(({ data }) => markAsRead(data.notificationId))

export const archiveNotificationFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ notificationId: z.string() }))
  .handler(({ data }) => archiveNotification(data.notificationId))

export const unarchiveNotificationFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ notificationId: z.string() }))
  .handler(({ data }) => unarchiveNotification(data.notificationId))

export const deleteNotificationFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ notificationId: z.string() }))
  .handler(({ data }) => deleteNotification(data.notificationId))
