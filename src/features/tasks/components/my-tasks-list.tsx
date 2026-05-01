import { useQueries, useQuery } from "@tanstack/react-query"
import { CheckCircle2, CheckSquare } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { myProjectsQueryOptions } from "@/features/projects"
import { taskQueries } from "@/features/tasks"
import { userQueries } from "@/features/users/queries"

export function MyTasksList() {
  const { data: user } = useQuery(userQueries.me())
  const userId = user?.id

  const { data: projects = [], isLoading: projectsLoading } = useQuery(
    myProjectsQueryOptions()
  )

  const tasksQueries = useQueries({
    queries: projects.map((p) =>
      taskQueries.list(p.id, {
        assignee_ids__contains: userId ? [userId] : [],
        is_deleted__eq: false,
        page: 1,
        page_size: "all",
      })
    ),
  })

  const allTasks = tasksQueries.flatMap((q) => q.data?.founds ?? [])
  const isLoading = projectsLoading || tasksQueries.some((q) => q.isLoading)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <CheckSquare className="size-4 text-muted-foreground" />
          <span>My Tasks</span>
        </CardTitle>
        <div className="rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
          {allTasks.length}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {isLoading ? (
          <div className="space-y-4 p-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded" />
            ))}
          </div>
        ) : allTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
            <CheckCircle2 className="mb-2 size-8 text-muted-foreground/30" />
            <p className="text-sm">You are all caught up!</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>Task Name</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Due Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allTasks.map((task) => {
                const project = projects.find((p) => p.id === task.project_id)
                const isOverdue =
                  task.due_date && new Date(task.due_date) < new Date()

                return (
                  <TableRow
                    key={task.id}
                    className="cursor-default hover:bg-muted/50"
                  >
                    <TableCell className="font-medium">{task.title}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {project?.name || "Unknown"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="text-[10px] capitalize"
                      >
                        {task.status_id}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className={`text-right text-xs ${isOverdue ? "font-medium text-red-500" : "text-muted-foreground"}`}
                    >
                      {task.due_date
                        ? new Date(task.due_date).toLocaleDateString()
                        : "-"}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
