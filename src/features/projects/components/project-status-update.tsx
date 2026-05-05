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
import {
  MOCK_PROJECT_TASKS,
  type TProjectDashboardTask,
} from "@/features/projects/mocks"
import { TASK_STATUS_CATALOG } from "@/features/tasks/constants"

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "")
}

function getCatalogItem<
  T extends { value: string; label: string; color: string },
>(value: string | undefined | null, catalog: readonly T[]) {
  if (!value) return null
  const normalizedValue = normalize(value)
  return (
    catalog.find(
      (item) =>
        normalize(item.value) === normalizedValue ||
        normalize(item.label) === normalizedValue
    ) ?? null
  )
}

function formatDateTime(date?: string | Date | null) {
  if (!date) return "-"
  return new Date(date).toLocaleString(undefined, {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function getUpdatedBy(task: TProjectDashboardTask) {
  return task.assignees?.[0]?.user?.name ?? "Team"
}

function getStatusLabel(value: string | undefined | null) {
  const item = getCatalogItem(value, TASK_STATUS_CATALOG)
  return item?.label ?? value ?? "Unknown"
}

function getStatusTransition(task: TProjectDashboardTask) {
  const from = getStatusLabel(task.status_from ?? "To Do")
  const to = getStatusLabel(task.status_to ?? task.status ?? task.status_id)
  return `${from} → ${to}`
}

function getLatestStatusColor(task: TProjectDashboardTask) {
  const latestStatus =
    getCatalogItem(
      task.status_to ?? task.status ?? task.status_id,
      TASK_STATUS_CATALOG
    ) ?? getCatalogItem(task.status_from ?? "To Do", TASK_STATUS_CATALOG)

  return latestStatus?.color ?? "currentColor"
}

function isInCurrentWeek(date?: string | Date | null) {
  if (!date) return false
  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 7)
  const d = typeof date === "string" ? new Date(date) : new Date(date)
  return d >= startOfWeek && d < endOfWeek
}

export function ProjectStatusUpdate() {
  const items = MOCK_PROJECT_TASKS.filter((t) =>
    isInCurrentWeek(t.due_date)
  ).sort((a, b) => {
    const da = a.due_date ? new Date(a.due_date).getTime() : 0
    const db = b.due_date ? new Date(b.due_date).getTime() : 0
    return db - da
  }) as TProjectDashboardTask[]

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
                    <div className="truncate font-medium">{it.title}</div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {(() => {
                        const status = getCatalogItem(
                          it.status ?? it.status_id,
                          TASK_STATUS_CATALOG
                        )
                        return status ? (
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
                        ) : null
                      })()}
                    </div>
                  </div>
                  <div className="shrink-0 text-right text-xs text-muted-foreground">
                    <div className="font-medium text-foreground">
                      Updated by {getUpdatedBy(it)}
                    </div>
                    <div>{formatDateTime(it.due_date)}</div>
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
