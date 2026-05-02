import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  TooltipProvider,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { formatDistanceToNow } from "date-fns"
import {
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  Circle,
  Trash2,
} from "lucide-react"
import {
  deleteInboxFn,
  markInboxAsReadFn,
  toggleInboxBookmarkFn,
  unarchiveInboxFn,
} from "../functions"
import { inboxKeys } from "../queries"
import type { TInboxItem } from "../schemas"
import { useInboxStore } from "@/stores/use-inbox-store"
import { InboxActionButton } from "./inbox-action-button"

interface IInboxItemProps {
  item: TInboxItem
  isSelected?: boolean
}

export const InboxItem = ({ item, isSelected }: IInboxItemProps) => {
  const { setSelectedItemId } = useInboxStore()
  const queryClient = useQueryClient()

  const refreshInbox = () => {
    queryClient.invalidateQueries({ queryKey: inboxKeys.all })
  }

  // ACTIVE -> ARCHIVED
  const markAsReadMutation = useMutation({
    mutationFn: (id: string) =>
      markInboxAsReadFn({ data: { inboxItemId: id } }),
    onSuccess: () => {
      refreshInbox()
    },
  })

  // ARCHIVED -> ACTIVE (Mark as Unread)
  const markAsUnreadMutation = useMutation({
    mutationFn: (id: string) => unarchiveInboxFn({ data: { inboxItemId: id } }),
    onSuccess: () => {
      refreshInbox()
    },
  })

  // ARCHIVED/ACTIVE <-> BOOKMARKED
  const toggleBookmarkMutation = useMutation({
    mutationFn: (id: string) =>
      toggleInboxBookmarkFn({ data: { inboxItemId: id } }),
    onSuccess: () => {
      refreshInbox()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteInboxFn({ data: { inboxItemId: id } }),
    onSuccess: () => {
      refreshInbox()
    },
  })

  const handleToggleRead = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (item.status === "ACTIVE") {
      markAsReadMutation.mutate(item.id)
    } else {
      markAsUnreadMutation.mutate(item.id)
    }
  }

  const handleToggleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleBookmarkMutation.mutate(item.id)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    deleteMutation.mutate(item.id)
  }

  return (
    <TooltipProvider>
      <Card
        onClick={() => setSelectedItemId(item.id)}
        className={cn(
          "group relative cursor-pointer transition-all hover:bg-accent/50",
          item.status === "ACTIVE" && "bg-muted/40",
          isSelected && "ring-2 ring-primary ring-offset-0"
        )}
        size="sm"
      >
        <CardHeader className="pb-0">
          <CardTitle
            className={cn(
              "line-clamp-1 flex items-center gap-2",
              item.status === "ACTIVE"
                ? "text-foreground"
                : "text-muted-foreground/80"
            )}
          >
            {item.status === "ACTIVE" && (
              <span className="size-2 shrink-0 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.4)]" />
            )}
            {item.title}
          </CardTitle>
          <CardDescription className="line-clamp-2 text-xs leading-relaxed">
            {item.content?.substring(0, 300)}
          </CardDescription>
          <CardAction className="opacity-0 transition-opacity group-hover:opacity-100">
            <div className="flex items-center gap-1">
              <InboxActionButton
                icon={item.status === "BOOKMARKED" ? BookmarkCheck : Bookmark}
                tooltip={
                  item.status === "BOOKMARKED" ? "Remove bookmark" : "Bookmark"
                }
                onClick={handleToggleBookmark}
                className={cn(
                  item.status === "BOOKMARKED" &&
                    "text-yellow-500 hover:text-yellow-600"
                )}
              />
              <InboxActionButton
                icon={item.status === "ACTIVE" ? CheckCircle2 : Circle}
                tooltip={
                  item.status === "ACTIVE" ? "Mark as read" : "Mark as unread"
                }
                onClick={handleToggleRead}
                className={cn(
                  item.status === "ARCHIVED" &&
                    "text-orange-500 hover:text-orange-600"
                )}
              />
              <InboxActionButton
                icon={Trash2}
                tooltip="Delete"
                onClick={handleDelete}
                className="hover:text-destructive"
              />
            </div>
          </CardAction>
        </CardHeader>

        <CardFooter className="flex items-center justify-between gap-2 border-none bg-transparent">
          <Badge variant={item.type === "INVITATION" ? "default" : "secondary"}>
            {item.type}
          </Badge>
          <span className="text-xs font-medium text-muted-foreground/60">
            {formatDistanceToNow(new Date(item.created_at), {
              addSuffix: true,
            })}
          </span>
        </CardFooter>
      </Card>
    </TooltipProvider>
  )
}
