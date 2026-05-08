import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { AlertCircle } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { projectRecentStatusUpdatesQueryOptions } from "../queries"
import type { TTaskActivity } from "../schemas"

function formatDateTime(date?: string | Date | null) {
  if (!date) return "-"
  return new Date(date).toLocaleString(undefined, {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function getStatusTransition(task: TTaskActivity) {
  const from = task.old_status_name ?? "To Do"
  const to = task.new_status_name ?? "Unknown"
  return `${from} → ${to}`
}

function getLatestStatusColor(task: TTaskActivity) {
  return task.new_status_color ?? task.old_status_color ?? "currentColor"
}

export function ProjectStatusUpdate({ projectId }: { projectId: string }) {
  const { data: items = [] } = useQuery(
    projectRecentStatusUpdatesQueryOptions(projectId, 15)
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent status updates</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96 w-full">
          <div className="flex flex-col divide-y">
            {items.length === 0 ? (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <AlertCircle className="size-4" />
                  </EmptyMedia>
                  <EmptyTitle>No updates this week</EmptyTitle>
                  <EmptyDescription>
                    Tasks haven't been updated yet this week. Check back later
                    for status changes.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              items.map((it) => (
                <div
                  key={it.id}
                  className="flex items-start justify-between gap-4 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{it.task_title}</div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {it.new_status_name ? (
                        <Badge
                          variant="outline"
                          className="gap-1.5 "
                        >
                          <span
                            className="size-1.5 shrink-0 rounded-full"
                            style={{
                              backgroundColor: getLatestStatusColor(it),
                            }}
                          />
                          {getStatusTransition(it)}
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                  <div className="shrink-0 text-right text-xs text-muted-foreground">
                    <div className="font-medium text-foreground">
                      Updated by {it.user_name}
                    </div>
                    <div>{formatDateTime(it.created_at)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

export default ProjectStatusUpdate
