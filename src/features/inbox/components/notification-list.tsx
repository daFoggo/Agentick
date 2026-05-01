import { NotificationItem } from "./notification-item"
import type { TNotification } from "../schemas"
import { Inbox } from "lucide-react"

interface INotificationListProps {
  notifications: TNotification[]
}

export const NotificationList = ({ notifications }: INotificationListProps) => {
  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
        <div className="rounded-full bg-muted p-6 mb-4">
          <Inbox className="size-10" />
        </div>
        <h3 className="text-xl font-semibold text-foreground">All caught up!</h3>
        <p className="max-w-xs mt-2">
          You have no new notifications at the moment.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {notifications.map((notification) => (
        <NotificationItem key={notification.id} notification={notification} />
      ))}
    </div>
  )
}
