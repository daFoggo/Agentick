import { TaskTable, taskQueries } from "@/features/tasks"
import { taskConfigQueries } from "@/features/task-config"
import { projectQueryOptions } from "@/features/projects/queries"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import type { TTask } from "@/features/tasks"
import type { TProjectMember } from "@/features/project-members"

function mapTaskData(
  task: {
    id: string
    project_id: string
    title: string
    description?: string | null
    status_id: string
    type_id: string
    priority_id: string
    assigner_id?: string | null
    assignee_id?: string | null
    assignee_ids?: string[] | null
    phase_id?: string | null
    start_date?: string | Date | null
    due_date?: string | Date | null
    created_at?: string | Date
    updated_at?: string | Date
    order?: number
    is_archived?: boolean
    is_deleted?: boolean
  },
  members: TProjectMember[],
  options: {
    statuses: Array<{ id: string; name: string }>
    types: Array<{ id: string; name: string }>
    priorities: Array<{ id: string; name: string }>
  }
): TTask {
  const assigneeIds = (task.assignee_ids && task.assignee_ids.length > 0)
    ? task.assignee_ids
    : (task.assignee_id ? [task.assignee_id] : [])

  const assignees = members.filter((item) => assigneeIds.includes(item.id))

  const display = (id: string, catalog: Array<{ id: string; name: string }>) =>
    catalog.find((item) => item.id === id)?.name ?? id

  return {
    id: task.id,
    project_id: task.project_id,
    parent_id: null,
    title: task.title,
    description: task.description ?? null,
    status_id: task.status_id,
    type_id: task.type_id,
    priority_id: task.priority_id,
    assigner_id: task.assigner_id ?? "",
    type: display(task.type_id, options.types),
    status: display(task.status_id, options.statuses),
    priority: display(task.priority_id, options.priorities),
    phase_id: task.phase_id ?? null,
    assignee_ids: assigneeIds,
    assignees: assignees,
    start_date: task.start_date ? new Date(task.start_date).toISOString() : new Date().toISOString(),
    due_date: task.due_date ? new Date(task.due_date).toISOString() : new Date().toISOString(),
    created_at: task.created_at ? new Date(task.created_at).toISOString() : new Date().toISOString(),
    updated_at: task.updated_at ? new Date(task.updated_at).toISOString() : new Date().toISOString(),
    order: task.order ?? 0,
    is_archived: !!task.is_archived,
    is_deleted: !!task.is_deleted,
    estimated_hours: 0,
    actual_hours: 0,
  }
}

export const Route = createFileRoute("/dashboard/$teamId/projects/$projectId/list")({
  component: ProjectListView,
})

function ProjectListView() {
  const { projectId } = Route.useParams()

  const { data: project } = useQuery(projectQueryOptions(projectId))
  const { data: tasksResponse } = useQuery(
    taskQueries.list(projectId, {
      ordering: "-id",
      page: 1,
      page_size: "all",
      is_deleted__eq: false,
    })
  )
  const { data: statusesResponse } = useQuery(
    taskConfigQueries.statuses(projectId, {
      page: 1,
      page_size: "all",
      ordering: "order",
    })
  )
  const { data: typesResponse } = useQuery(
    taskConfigQueries.types(projectId, {
      page: 1,
      page_size: "all",
      ordering: "order",
    })
  )
  const { data: prioritiesResponse } = useQuery(
    taskConfigQueries.priorities(projectId, {
      page: 1,
      page_size: "all",
      ordering: "order",
    })
  )

  const taskOptions = {
    statuses: statusesResponse?.founds ?? [],
    types: typesResponse?.founds ?? [],
    priorities: prioritiesResponse?.founds ?? [],
  }

  const tasks = (tasksResponse?.founds ?? []).map((task) =>
    mapTaskData(task, project?.members ?? [], taskOptions)
  )

  return (
    <TaskTable
      projectId={projectId}
      data={tasks}
      members={project?.members ?? []}
      statuses={taskOptions.statuses}
      types={taskOptions.types}
      priorities={taskOptions.priorities}
      groupBy="status"
    />
  )
}
