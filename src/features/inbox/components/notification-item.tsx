import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { Archive, Trash2, RotateCcw, CheckCircle2, Circle, Clock, Tag, UserPlus } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import type { TNotification } from "../schemas"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { 
  archiveNotificationFn, 
  deleteNotificationFn, 
  unarchiveNotificationFn,
  toggleBookmarkFn
} from "../functions"
import { inboxKeys } from "../queries"
import { useState } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useInvitationMutations } from "@/features/invitations/queries"

interface INotificationItemProps {
  notification: TNotification
}

export const NotificationItem = ({ notification }: INotificationItemProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()
  const { accept: acceptInvitation, decline: declineInvitation } = useInvitationMutations()

  const refreshInbox = () => {
    queryClient.invalidateQueries({ queryKey: inboxKeys.all })
  }

  const toggleReadMutation = useMutation({
    mutationFn: (id: string) => toggleBookmarkFn({ data: { notificationId: id } }),
    onSuccess: () => {
      refreshInbox()
      setIsOpen(false)
    },
  })

  const archiveMutation = useMutation({
    mutationFn: (id: string) => archiveNotificationFn({ data: { notificationId: id } }),
    onSuccess: () => {
      refreshInbox()
      setIsOpen(false)
    },
  })

  const unarchiveMutation = useMutation({
    mutationFn: (id: string) => unarchiveNotificationFn({ data: { notificationId: id } }),
    onSuccess: () => {
      refreshInbox()
      setIsOpen(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteNotificationFn({ data: { notificationId: id } }),
    onSuccess: () => {
      refreshInbox()
      setIsOpen(false)
    },
  })

  const handleOpenDetail = () => {
    setIsOpen(true)
  }

  const handleToggleRead = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleReadMutation.mutate(notification.id)
  }

  const handleArchive = (e: React.MouseEvent) => {
    e.stopPropagation()
    archiveMutation.mutate(notification.id)
    setIsOpen(false)
  }

  const handleUnarchive = (e: React.MouseEvent) => {
    e.stopPropagation()
    unarchiveMutation.mutate(notification.id)
    setIsOpen(false)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    deleteMutation.mutate(notification.id)
    setIsOpen(false)
  }

  const handleAcceptInvitation = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (notification.resource_id) {
      acceptInvitation.mutate(notification.resource_id)
      deleteMutation.mutate(notification.id) // Xóa luôn tin nhắn sau khi accept
    }
  }



  return (
    <TooltipProvider>
      <Card
        onClick={handleOpenDetail}
        className={cn(
          "group relative flex flex-col gap-2 p-5 transition-all cursor-pointer border-l-4 rounded-xl mb-3 shadow-sm hover:shadow-md",
          !notification.is_read 
            ? "bg-primary/5 dark:bg-primary/10 border-l-primary"
            : "bg-white dark:bg-slate-900 border-l-transparent hover:bg-slate-50 dark:hover:bg-slate-800"
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <Avatar className="mt-1 size-10 shrink-0 shadow-sm">
              <AvatarFallback className={cn(
                "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
                !notification.is_read && "bg-primary text-primary-foreground font-bold"
              )}>
                {notification.type.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1.5 min-w-0">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-[15px] truncate",
                  !notification.is_read ? "font-bold text-slate-900 dark:text-slate-100" : "font-medium text-slate-500"
                )}>
                  {notification.title}
                </span>
                {!notification.is_read && (
                  <div className="size-2 rounded-full bg-primary animate-pulse" />
                )}
              </div>
              <p className={cn(
                "text-sm line-clamp-1",
                !notification.is_read ? "text-slate-700 dark:text-slate-300" : "text-slate-400"
              )}>
                {notification.content}
              </p>
              <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="size-3" />
                  {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1">
            {notification.status === "ACTIVE" && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-full"
                    onClick={handleToggleRead}
                  >
                    {notification.is_read ? <Circle className="size-4" /> : <CheckCircle2 className="size-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{notification.is_read ? "Mark as unread" : "Mark as done"}</TooltipContent>
              </Tooltip>
            )}

            {notification.status === "ACTIVE" ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
                    onClick={handleArchive}
                  >
                    <Archive className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Archive</TooltipContent>
              </Tooltip>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-orange-400 hover:text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded-full"
                    onClick={handleUnarchive}
                  >
                    <RotateCcw className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Restore</TooltipContent>
              </Tooltip>
            )}
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-slate-400 hover:text-destructive hover:bg-destructive/10 rounded-full"
                  onClick={handleDelete}
                >
                  <Trash2 className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none shadow-2xl rounded-2xl bg-white dark:bg-slate-950">
          <div className="px-6 py-3 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {notification.status === "ACTIVE" && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleToggleRead}
                  className={cn(
                    "font-bold rounded-full transition-all",
                    notification.is_read 
                      ? "text-slate-500 hover:bg-slate-200" 
                      : "text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200"
                  )}
                >
                  {notification.is_read ? (
                    <>
                      <Circle className="size-4 mr-2" />
                      Mark Unread
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="size-4 mr-2" />
                      Mark as Done
                    </>
                  )}
                </Button>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              {notification.status === "ACTIVE" ? (
                <Button variant="ghost" size="icon" onClick={handleArchive} className="size-9 rounded-full text-slate-400 hover:text-slate-600" title="Archive">
                  <Archive className="size-4" />
                </Button>
              ) : (
                <Button variant="ghost" size="icon" onClick={handleUnarchive} className="size-9 rounded-full text-orange-400 hover:text-orange-600 hover:bg-orange-50" title="Restore">
                  <RotateCcw className="size-4" />
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={handleDelete} className="size-9 rounded-full text-slate-400 hover:text-destructive" title="Delete">
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>

          <div className="p-8">
            <div className="flex flex-col gap-6">
              {/* Header Info */}
              <div className="flex flex-col gap-4">
                <DialogTitle className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                  {notification.title}
                </DialogTitle>
                
                <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <Tag className="size-4" />
                    <span className="font-semibold uppercase tracking-wider text-[11px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      {notification.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="size-4" />
                    <span>{new Date(notification.created_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <DialogDescription className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {notification.content}
                </DialogDescription>
              </div>

              {notification.type === "INVITATION" && notification.resource_id && (
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <Button 
                    onClick={handleAcceptInvitation}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-md shadow-primary/20 transition-all"
                  >
                    <UserPlus className="size-4 mr-2" />
                    Accept Invitation
                  </Button>
                </div>
              )}

              {notification.data && Object.keys(notification.data).length > 0 && (
                <div className="mt-4 p-5 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 shadow-inner font-mono text-xs overflow-auto max-h-[300px]">
                  <pre className="text-slate-500 leading-relaxed">
                    {JSON.stringify(notification.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter className="px-8 py-6 border-t border-slate-50 dark:border-slate-900 flex items-center justify-end">
            <Button 
              onClick={() => setIsOpen(false)} 
              className="bg-slate-900 hover:bg-black dark:bg-slate-200 dark:text-black dark:hover:bg-white font-bold px-8 h-10 rounded-lg shadow-lg shadow-slate-200 dark:shadow-none transition-all active:scale-95"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}

