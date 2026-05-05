import * as React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Rectangle } from "recharts"
import { ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { ButtonGroup } from "@/components/ui/button-group"
import { Button } from "@/components/ui/button"
import {
  TASK_PRIORITY_CATALOG,
  TASK_STATUS_CATALOG,
  TASK_TYPE_CATALOG,
} from "@/features/tasks/constants"
import { MOCK_PROJECT_TASKS } from "@/features/projects/mocks"
import type { TTask } from "@/features/tasks/schemas"

type ViewMode = "priority" | "status" | "type"

function buildSeries(tasks: Partial<TTask>[], mode: ViewMode) {
  if (mode === "priority") {
    const counts = TASK_PRIORITY_CATALOG.map((p) => ({
      label: p.label,
      value: 0,
      color: p.color,
    }))
    tasks.forEach((t) => {
      const priority =
        TASK_PRIORITY_CATALOG.find((p) => p.value === (t.priority_id as any)) ??
        TASK_PRIORITY_CATALOG.find((p) => p.isDefault)
      const item = counts.find((c) => c.label === priority?.label)
      if (item) item.value = (item.value ?? 0) + 1
    })
    return counts.map((c) => ({
      name: c.label,
      value: c.value,
      fill: c.color,
    }))
  }

  if (mode === "status") {
    const counts = tasks.reduce(
      (acc, t) => {
        const statusLabel = t.status || "Unknown"
        // Match by label from catalog, or use the string as-is
        const statusCatalog = TASK_STATUS_CATALOG.find(
          (s) => s.label.toLowerCase() === statusLabel.toLowerCase()
        )
        const label = statusCatalog?.label || statusLabel
        const color = statusCatalog?.color || "#94a3b8"

        const existing = acc.find((c) => c.label === label)
        if (existing) {
          existing.value += 1
        } else {
          acc.push({ label, value: 1, color })
        }
        return acc
      },
      [] as { label: string; value: number; color: string }[]
    )
    return counts.map((c) => ({
      name: c.label,
      value: c.value,
      fill: c.color,
    }))
  }

  if (mode === "type") {
    const counts = tasks.reduce(
      (acc, t) => {
        const typeLabel = t.type || "Unknown"
        // Match by label from catalog, or use the string as-is
        const typeCatalog = TASK_TYPE_CATALOG.find(
          (ty) => ty.label.toLowerCase() === typeLabel.toLowerCase()
        )
        const label = typeCatalog?.label || typeLabel
        const color = typeCatalog?.color || "#64748b"

        const existing = acc.find((c) => c.label === label)
        if (existing) {
          existing.value += 1
        } else {
          acc.push({ label, value: 1, color })
        }
        return acc
      },
      [] as { label: string; value: number; color: string }[]
    )
    return counts.map((c) => ({
      name: c.label,
      value: c.value,
      fill: c.color,
    }))
  }

  return []
}

export const ProjectTaskStatsCard = () => {
  const [mode, setMode] = React.useState<ViewMode>("priority")

  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 7)

  const tasksThisWeek = MOCK_PROJECT_TASKS.filter((t) => {
    if (!t.due_date) return false
    const d = new Date(t.due_date)
    return d >= startOfWeek && d < endOfWeek
  }) as Partial<TTask>[]

  const data = buildSeries(tasksThisWeek, mode)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle>
            Total tasks{" "}
            <span className="text-sm text-muted-foreground">(this week)</span>
          </CardTitle>
          <ButtonGroup orientation="horizontal">
            <Button
              size="sm"
              variant={mode === "priority" ? "default" : "outline"}
              onClick={() => setMode("priority")}
            >
              Priority
            </Button>
            <Button
              size="sm"
              variant={mode === "status" ? "default" : "outline"}
              onClick={() => setMode("status")}
            >
              Status
            </Button>
            <Button
              size="sm"
              variant={mode === "type" ? "default" : "outline"}
              onClick={() => setMode("type")}
            >
              Type
            </Button>
          </ButtonGroup>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer
          id="project-stats"
          className="aspect-auto"
          config={{ value: { label: "Tasks", color: "var(--chart-1)" } }}
          style={{ height: 240 }}
        >
          <BarChart data={data} barCategoryGap="20%" barGap={8}>
            <CartesianGrid strokeDasharray="3 3" vertical={true} />
            <XAxis dataKey="name" tickLine={false} />
            <YAxis allowDecimals={false} width={44} />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelKey="name"
                  nameKey="value"
                  indicator="dot"
                />
              }
            />
            <Bar
              dataKey="value"
              radius={[8, 8, 0, 0]}
              shape={(props: any) => {
                const { fill, ...others } = props
                return <Rectangle {...others} fill={props.payload.fill} />
              }}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
