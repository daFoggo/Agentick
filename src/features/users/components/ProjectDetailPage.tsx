// src/features/users/components/user-profile/ProjectDetailPage.tsx
import { useQuery } from "@tanstack/react-query"
import { useParams, useNavigate } from "@tanstack/react-router"
import { api } from "@/lib/ky"
import type { TBaseResponse } from "@/types/api"
import { getStoredTeamId, Avatar, Skeleton } from "./ProfilePage"

interface ProjectRead {
  id: string
  name: string
  description?: string
  created_at: string
}

interface ProjectMemberRead {
  user_id: string
  role: string
  user?: { id: string; email: string; full_name: string }
}

interface TaskRead {
  id: string
  title: string
  description?: string
  status_id?: string
  priority_id?: string
  due_date?: string
  assignee_id?: string
}

interface PhaseRead {
  id: string
  name: string
  start_date?: string
  end_date?: string
}

interface TaskStatusRead {
  id: string
  name: string
  color?: string
  order: number
}

interface TaskPriorityRead {
  id: string
  name: string
  color?: string
  order: number
}

const projectQueries = {
  detail: (projectId: string) => ({
    queryKey: ["projects", projectId],
    queryFn: async () => {
      const res = await api
        .get(`projects/${projectId}`)
        .json<TBaseResponse<ProjectRead>>()
      return res.data
    },
    enabled: !!projectId,
  }),
  members: (projectId: string) => ({
    queryKey: ["projects", projectId, "members"],
    queryFn: async () => {
      const res = await api
        .get(`projects/${projectId}/members`)
        .json<TBaseResponse<{ items: ProjectMemberRead[] }>>()
      return res.data?.items ?? []
    },
    enabled: !!projectId,
  }),
  tasks: (projectId: string) => ({
    queryKey: ["projects", projectId, "tasks"],
    queryFn: async () => {
      const res = await api
        .get(`projects/${projectId}/tasks`)
        .json<TBaseResponse<{ items: TaskRead[] }>>()
      return res.data?.items ?? []
    },
    enabled: !!projectId,
  }),
  phases: (projectId: string) => ({
    queryKey: ["projects", projectId, "phases"],
    queryFn: async () => {
      const res = await api
        .get(`projects/${projectId}/phases`)
        .json<TBaseResponse<{ items: PhaseRead[] }>>()
      return res.data?.items ?? []
    },
    enabled: !!projectId,
  }),
  statuses: (projectId: string) => ({
    queryKey: ["projects", projectId, "task-config", "statuses"],
    queryFn: async () => {
      const res = await api
        .get(`projects/${projectId}/task-config/statuses`)
        .json<TBaseResponse<{ items: TaskStatusRead[] }>>()
      return res.data?.items ?? []
    },
    enabled: !!projectId,
  }),
  priorities: (projectId: string) => ({
    queryKey: ["projects", projectId, "task-config", "priorities"],
    queryFn: async () => {
      const res = await api
        .get(`projects/${projectId}/task-config/priorities`)
        .json<TBaseResponse<{ items: TaskPriorityRead[] }>>()
      return res.data?.items ?? []
    },
    enabled: !!projectId,
  }),
}

export function ProjectDetailPage() {
  const { projectId } = useParams({
    from: "/dashboard/$teamId/projects/$projectId",
  })
  const navigate = useNavigate()
  const teamId = getStoredTeamId()

  const { data: project, isLoading: projectLoading } = useQuery(
    projectQueries.detail(projectId)
  )
  const { data: members = [] } = useQuery(projectQueries.members(projectId))
  const { data: tasks = [] } = useQuery(projectQueries.tasks(projectId))
  const { data: phases = [] } = useQuery(projectQueries.phases(projectId))
  const { data: statuses = [] } = useQuery(projectQueries.statuses(projectId))
  const { data: priorities = [] } = useQuery(
    projectQueries.priorities(projectId)
  )

  if (projectLoading) {
    return (
      <div className="p-8">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="mt-4 h-64" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Project not found.</p>
        <button
          onClick={() => navigate({ to: `/dashboard/${teamId}/profile` })}
          className="mt-4 rounded-md bg-violet-600 px-4 py-2 text-sm text-white"
        >
          Back to Profile
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {project.name}
            </h1>
            {project.description && (
              <p className="text-muted-foreground">{project.description}</p>
            )}
          </div>
          <button
            onClick={() => navigate({ to: `/dashboard/${teamId}/profile` })}
            className="rounded-md border border-border px-4 py-2 text-sm text-foreground hover:bg-muted"
          >
            Back to Profile
          </button>
        </div>

        {/* Members */}
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            Members
          </h2>
          <div className="flex flex-wrap gap-4">
            {members.map((m) => (
              <div key={m.user_id} className="flex items-center gap-2">
                <Avatar name={m.user?.full_name ?? m.user_id} size={32} />
                <span className="text-sm text-foreground">
                  {m.user?.full_name ?? m.user_id}
                </span>
                <span className="text-xs text-muted-foreground capitalize">
                  ({m.role})
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Phases */}
        {phases.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-4">
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              Phases
            </h2>
            <div className="space-y-2">
              {phases.map((phase) => (
                <div
                  key={phase.id}
                  className="flex justify-between border-b border-border pb-2 text-sm"
                >
                  <span className="text-foreground">{phase.name}</span>
                  <span className="text-muted-foreground">
                    {phase.start_date &&
                      new Date(phase.start_date).toLocaleDateString()}{" "}
                    →{" "}
                    {phase.end_date &&
                      new Date(phase.end_date).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tasks */}
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="mb-3 text-lg font-semibold text-foreground">Tasks</h2>
          {tasks.length === 0 ? (
            <p className="text-muted-foreground">No tasks yet.</p>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="border-b border-border pb-2 last:border-0"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-foreground">
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-xs text-muted-foreground">
                          {task.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 text-xs">
                      {task.due_date && (
                        <span className="text-muted-foreground">
                          Due: {new Date(task.due_date).toLocaleDateString()}
                        </span>
                      )}
                      {task.status_id && (
                        <span className="text-muted-foreground">
                          Status:{" "}
                          {statuses.find((s) => s.id === task.status_id)
                            ?.name ?? task.status_id}
                        </span>
                      )}
                      {task.priority_id && (
                        <span className="text-muted-foreground">
                          Priority:{" "}
                          {priorities.find((p) => p.id === task.priority_id)
                            ?.name ?? task.priority_id}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Task Configuration (optional) */}
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            Task Configuration
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-foreground">Statuses</p>
              <ul className="mt-1 list-inside list-disc space-y-1">
                {statuses.map((s) => (
                  <li
                    key={s.id}
                    style={{ color: s.color || "inherit" }}
                    className="text-muted-foreground"
                  >
                    {s.name}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-medium text-foreground">Priorities</p>
              <ul className="mt-1 list-inside list-disc space-y-1">
                {priorities.map((p) => (
                  <li
                    key={p.id}
                    style={{ color: p.color || "inherit" }}
                    className="text-muted-foreground"
                  >
                    {p.name}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
