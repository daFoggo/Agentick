import { api } from "@/lib/ky"
import type { TInboxStats, TNotification, TNotificationStatus } from "./schemas"
import type { TBaseResponse } from "@/types/api"

export const fetchInboxStats = async (): Promise<TInboxStats> => {
  const response = await api.get("notifications/stats").json<TBaseResponse<TInboxStats>>()
  return response.data
}

export const fetchNotifications = async (
  status: TNotificationStatus = "ACTIVE",
  isRead?: boolean,
  isBookmarked?: boolean
): Promise<TNotification[]> => {
  const response = await api.get("notifications/me", {
    searchParams: { 
      status,
      ...(isRead !== undefined && { is_read: isRead }),
      ...(isBookmarked !== undefined && { is_bookmarked: isBookmarked })
    }
  }).json<TBaseResponse<TNotification[]>>()
  return response.data
}

export const toggleBookmark = async (notificationId: string): Promise<TNotification> => {
  const response = await api.patch(`notifications/${notificationId}/bookmark`).json<TBaseResponse<TNotification>>()
  return response.data
}

export const markAsRead = async (notificationId: string): Promise<TNotification> => {
  const response = await api.patch(`notifications/${notificationId}/read`).json<TBaseResponse<TNotification>>()
  return response.data
}

export const archiveNotification = async (notification_id: string): Promise<TNotification> => {
  const response = await api.patch(`notifications/${notification_id}/archive`).json<TBaseResponse<TNotification>>()
  return response.data
}

export const unarchiveNotification = async (notification_id: string): Promise<TNotification> => {
  const response = await api.patch(`notifications/${notification_id}/unarchive`).json<TBaseResponse<TNotification>>()
  return response.data
}

export const deleteNotification = async (notificationId: string): Promise<boolean> => {
  const response = await api.delete(`notifications/${notificationId}`).json<TBaseResponse<boolean>>()
  return response.data
}
