// src/features/users/components/user-profile/AllTasksPage.tsx
import { useQueries, useQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { api } from "@/lib/ky"
import type { TBaseResponse } from "@/types/api"
import { getStoredTeamId, Skeleton } from "./ProfilePage"

interface ProjectRead {
  id: string
  name: string
}

interface TaskRead {
  id: string
  title: string
  description?: string
  due_date?: string
  project_id: string
  project_name?: string
  assignee_id?: string
}

const queries = {
  myProjects: () => ({
    queryKey: ["projects", "me"],
    queryFn: async () => {
      const res = await api
        .get("projects/me")
        .json<TBaseResponse<ProjectRead[]>>()
      return res.data ?? []
    },
  }),
  projectTasks: (projectId: string) => ({
    queryKey: ["projects", projectId, "tasks"],
    queryFn: async () => {
      const res = await api
        .get(`projects/${projectId}/tasks`)
        .json<TBaseResponse<{ items: TaskRead[] }>>()
      return (res.data?.items ?? []).map((t) => ({
        ...t,
        project_id: projectId,
      }))
    },
  }),
}

export function AllTasksPage() {
  const navigate = useNavigate()
  const teamId = getStoredTeamId()
  const { data: projects = [], isLoading: projectsLoading } = useQuery(
    queries.myProjects()
  )

  const tasksQueries = useQueries({
    queries: projects.map((p) => queries.projectTasks(p.id)),
  })

  const allTasks = tasksQueries.flatMap((q) => q.data ?? [])
  const isLoading = projectsLoading || tasksQueries.some((q) => q.isLoading)

  if (isLoading) {
    return (
      <div className="p-8">
        <Skeleton className="h-12 w-1/3" />
        <div className="mt-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">All My Tasks</h1>
          <button
            onClick={() => navigate({ to: `/dashboard/${teamId}/profile` })}
            className="rounded-md border border-border px-4 py-2 text-sm text-foreground hover:bg-muted"
          >
            Back to Profile
          </button>
        </div>

        {allTasks.length === 0 ? (
          <p className="text-center text-muted-foreground">No tasks found.</p>
        ) : (
          <div className="space-y-3">
            {allTasks.map((task) => (
              <div
                key={task.id}
                className="rounded-lg border border-border bg-card p-4 shadow-sm"
              >
                <h3 className="font-semibold text-foreground">{task.title}</h3>
                {task.description && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {task.description}
                  </p>
                )}
                <p className="mt-2 text-xs text-muted-foreground">
                  Project:{" "}
                  {projects.find((p) => p.id === task.project_id)?.name ??
                    task.project_id}
                </p>
                {task.due_date && (
                  <p className="text-xs text-muted-foreground">
                    Due: {new Date(task.due_date).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
