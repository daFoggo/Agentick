import { TaskKanban, taskQueries, mapTaskData } from "@/features/tasks"
import { taskConfigQueries } from "@/features/task-config"
import { projectQueryOptions } from "@/features/projects"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { useMemo, useState, useEffect } from "react"
import { useKanbanStore } from "@/stores/use-kanban-store"

export const Route = createFileRoute(
  "/dashboard/$teamId/projects/$projectId/board"
)({
  component: ProjectBoardView,
  staticData: {
    fixedHeight: true,
  },
})

function ProjectBoardView() {
  const { projectId } = Route.useParams()

  // NOTE: All queries below are served from the cache instantly.
  // Data is prefetched in the parent route loader (route.tsx) via ensureQueryData.
  // See README §4.2 — Loader Prefetching Pattern.
  const { data: project } = useQuery(projectQueryOptions(projectId))
  const { data: tasksResponse } = useQuery(
    taskQueries.list(projectId, {
      ordering: "-id",
      page: 1,
      page_size: "all",
      is_deleted__eq: false,
    })
  )

  const commonParams = { page: 1, page_size: "all" } as const
  const { data: statusesResponse } = useQuery(
    taskConfigQueries.statuses(projectId, commonParams)
  )
  const { data: typesResponse } = useQuery(
    taskConfigQueries.types(projectId, commonParams)
  )
  const { data: prioritiesResponse } = useQuery(
    taskConfigQueries.priorities(projectId, commonParams)
  )

  const sortedStatuses = useMemo(() => {
    return [...(statusesResponse?.founds ?? [])].sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0)
    )
  }, [statusesResponse])

  const sortedTypes = useMemo(() => {
    return [...(typesResponse?.founds ?? [])].sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0)
    )
  }, [typesResponse])

  const sortedPriorities = useMemo(() => {
    return [...(prioritiesResponse?.founds ?? [])].sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0)
    )
  }, [prioritiesResponse])

  const members = useMemo(() => project?.members ?? [], [project?.members])

  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  const savedOrder = useKanbanStore((state) => state.columnOrders[projectId])

  const finalStatuses = useMemo(() => {
    if (!mounted || !savedOrder) return sortedStatuses
    return [...sortedStatuses].sort((a, b) => {
      const aIndex = savedOrder.indexOf(a.id)
      const bIndex = savedOrder.indexOf(b.id)
      if (aIndex === -1) return 1
      if (bIndex === -1) return -1
      return aIndex - bIndex
    })
  }, [sortedStatuses, savedOrder, mounted])

  const taskOptions = useMemo(() => ({
    statuses: finalStatuses,
    types: sortedTypes,
    priorities: sortedPriorities,
  }), [finalStatuses, sortedTypes, sortedPriorities])

  const tasks = useMemo(() => {
    return (tasksResponse?.founds ?? []).map((task) =>
      mapTaskData(task, project?.members ?? [], taskOptions)
    )
  }, [tasksResponse, project?.members, taskOptions])

  if (!mounted) return null

  return (
    <TaskKanban
      projectId={projectId}
      tasks={tasks}
      members={members}
      statuses={taskOptions.statuses}
      types={taskOptions.types}
      priorities={taskOptions.priorities}
    />
  )
}
