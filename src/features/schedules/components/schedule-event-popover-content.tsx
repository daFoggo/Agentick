import { FileText, CheckCircle2, Edit2, Tag } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { EventTypeBadge } from "@/features/events"
import type { IBigCalendarEvent } from "@/types/big-calendar"

interface IScheduleEventPopoverContentProps {
  event: IBigCalendarEvent
}

export function ScheduleEventPopoverContent({
  event,
}: IScheduleEventPopoverContentProps) {
  return (
    <div className="flex flex-col gap-3">
      {/* Type Badge */}
      {Boolean(event.meta?.type) && (
        <div className="flex items-center gap-2">
          <Tag className="size-3.5 text-muted-foreground" />
          <EventTypeBadge type={String(event.meta!.type)} />
        </div>
      )}

      {/* Description */}
      {Boolean(event.meta?.description) && (
        <div className="flex items-start gap-2">
          <FileText className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
          <p className="text-xs leading-relaxed text-muted-foreground">
            {String(event.meta!.description)}
          </p>
        </div>
      )}

      {/* Task ID / Actions */}
      {Boolean(event.meta?.task_id) && (
        <div className="flex items-center gap-2">
          <CheckCircle2 className="size-3.5 text-muted-foreground" />
          <span className="text-xs font-medium">
            Task: {String(event.meta!.task_id)}
          </span>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex justify-end">
        <Button variant="ghost" size="sm" className="gap-2">
          <Edit2 className="size-3" />
          <span>Edit</span>
        </Button>
      </div>
    </div>
  )
}
