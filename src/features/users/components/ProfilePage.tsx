import { useQuery, useQueries } from "@tanstack/react-query"
import { useParams, useNavigate } from "@tanstack/react-router"
import { useEffect } from "react"
import { motion } from "motion/react"
import { MapPin, Briefcase, Building, FileText, Settings, Plus, Camera } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { userQueries } from "../queries"
import { api } from "@/lib/ky"
import type { TBaseResponse } from "@/types/api"

// ─── Types ────────────────────────────────────────────────────────────────

interface UserInfo {
  id: string
  email: string
  name: string
  avatar_url?: string | null
  created_at?: string
}

interface ProjectRead {
  id: string
  name: string
  description?: string
  created_at: string
}

interface ProjectMemberRead {
  user_id: string
  role: string
  user?: { id: string; email: string; name: string }
}

interface TaskRead {
  id: string
  title: string
  description?: string
  status_id?: string
  priority_id?: string
  due_date?: string
  project_id: string
  project_name?: string
  assignee_id?: string
}

interface PhaseRead {
  id: string
  name: string
  start_date?: string
  end_date?: string
  project_id: string
}

// ─── Helper lưu teamId ────────────────────────────────────────────────────

export const TEAM_ID_STORAGE_KEY = "current_team_id"

export function getStoredTeamId(): string | null {
  return localStorage.getItem(TEAM_ID_STORAGE_KEY)
}

function setStoredTeamId(teamId: string | null) {
  if (teamId) {
    localStorage.setItem(TEAM_ID_STORAGE_KEY, teamId)
  } else {
    localStorage.removeItem(TEAM_ID_STORAGE_KEY)
  }
}

// ─── Query factories (centralized in queries.ts, local ones for specific data) ───────────────────────────────

const localProfileQueries = {
  myTasks: (userId: string) => ({
    queryKey: ["tasks", "assigned", userId],
    queryFn: async (): Promise<TaskRead[]> => {
      const res = await api
        .get("tasks", { searchParams: { assignee_id__eq: userId } })
        .json<TBaseResponse<{ founds: TaskRead[] }>>()
      return res.data?.founds ?? []
    },
    enabled: !!userId,
  }),

  projectMembers: (projectId: string) => ({
    queryKey: ["projects", projectId, "members"],
    queryFn: async (): Promise<ProjectMemberRead[]> => {
      const res = await api
        .get(`projects/${projectId}/members`)
        .json<TBaseResponse<{ founds: ProjectMemberRead[] }>>()
      return res.data?.founds ?? []
    },
    enabled: !!projectId,
    staleTime: 2 * 60 * 1000,
  }),
}

// ─── UI Helpers & Components ─────────────────────────────────────────────

function getInitials(name: string) {
  if (!name) return "?"
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function formatDate(dateStr?: string) {
  if (!dateStr) return ""
  return new Date(dateStr).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
  })
}

function formatDateRange(start?: string, end?: string) {
  if (!start && !end) return ""
  if (!end) return formatDate(start)
  return `${formatDate(start)} – ${formatDate(end)}`
}

const AVATAR_COLORS = [
  { bg: "#E5B800", text: "#7a5f00" },
  { bg: "#5c47f5", text: "#d0caff" },
  { bg: "#4caf50", text: "#1a5c1d" },
  { bg: "#e53935", text: "#ffd0d0" },
  { bg: "#00acc1", text: "#003f46" },
]

function avatarColor(str: string) {
  if (!str) return AVATAR_COLORS[0]
  const idx = str.charCodeAt(0) % AVATAR_COLORS.length
  return AVATAR_COLORS[idx]
}

export function Avatar({
  name,
  size = 40,
  className = "",
}: {
  name: string
  size?: number
  className?: string
}) {
  const { bg, text } = avatarColor(name)
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: bg,
        color: text,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.32,
        fontWeight: 500,
        flexShrink: 0,
        userSelect: "none",
      }}
    >
      {getInitials(name)}
    </div>
  )
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-muted ${className}`} />
}

function TaskItem({ task }: { task: TaskRead }) {
  const isOverdue = task.due_date && new Date(task.due_date) < new Date()
  return (
    <div className="flex cursor-pointer items-center gap-3 rounded border-b border-border/30 px-1 py-2 transition-colors last:border-0 hover:bg-muted/30">
      <div className="h-4 w-4 flex-shrink-0 rounded-full border-2 border-border transition-colors hover:border-primary" />
      <span className="flex-1 truncate text-sm text-foreground">
        {task.title}
      </span>
      <div className="flex flex-shrink-0 items-center gap-2">
        {task.project_name && (
          <span className="max-w-[80px] truncate rounded bg-violet-100 px-2 py-0.5 text-xs text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
            {task.project_name}
          </span>
        )}
        {task.due_date && (
          <span
            className={`text-xs ${isOverdue ? "text-red-500" : "text-muted-foreground"}`}
          >
            {formatDate(task.due_date)}
          </span>
        )}
      </div>
    </div>
  )
}

function ProjectItem({ project }: { project: ProjectRead }) {
  const { data: members = [] } = useQuery(
    localProfileQueries.projectMembers(project.id)
  )
  const navigate = useNavigate()
  const teamId = getStoredTeamId()

  const goToProject = () => {
    navigate({ to: `/dashboard/${teamId}/projects/${project.id}` })
  }

  return (
    <div
      onClick={goToProject}
      className="flex cursor-pointer items-center gap-3 rounded border-b border-border/30 px-1 py-2 transition-colors last:border-0 hover:bg-muted/30"
    >
      <div
        className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded"
        style={{ background: "#4caf50" }}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2.5"
        >
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
        </svg>
      </div>
      <span className="flex-1 truncate text-sm text-foreground">
        {project.name}
      </span>
      <div className="flex">
        {members.slice(0, 3).map((m, i) => (
          <div
            key={m.user_id}
            className="rounded-full border-2 border-card"
            style={{ marginLeft: i > 0 ? -6 : 0 }}
          >
            <Avatar name={m.user?.name ?? m.user_id} size={22} />
          </div>
        ))}
        {members.length > 3 && (
          <div
            className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-card text-[9px] text-muted-foreground"
            style={{ marginLeft: -6, background: "var(--muted)" }}
          >
            +{members.length - 3}
          </div>
        )}
      </div>
    </div>
  )
}



function StatCard({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: string
}) {
  return (
    <div className="rounded-lg bg-muted/40 p-3">
      <p className="mb-1 text-xs text-muted-foreground">{label}</p>
      <p className="text-xl font-medium" style={{ color }}>
        {value}
      </p>
    </div>
  )
}

function CollaboratorsList({
  projects,
  currentUserId,
}: {
  projects: ProjectRead[]
  currentUserId: string
}) {
  const memberQueries = useQueries({
    queries: projects
      .slice(0, 3)
      .map((project) => localProfileQueries.projectMembers(project.id)),
  })
  const allMembers = memberQueries
    .flatMap((q) => q.data ?? [])
    .filter((m) => m.user_id !== currentUserId)
  const unique = Array.from(
    new Map(allMembers.map((m) => [m.user_id, m])).values()
  ).slice(0, 5)

  if (unique.length === 0) {
    return (
      <div className="py-4 text-center">
        <div className="mx-auto mb-2 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-foreground">
          <span className="text-lg leading-none">+</span>
        </div>
        <p className="mb-1 text-xs font-medium text-foreground">
          Invite colleagues
        </p>
        <p className="text-xs text-muted-foreground">
          This space is reserved for your frequent collaborators.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {unique.map((m) => (
        <div key={m.user_id} className="flex items-center gap-3">
          <Avatar name={m.user?.name ?? m.user_id} size={28} />
          <div className="min-w-0">
            <p className="truncate text-sm text-foreground">
              {m.user?.name ?? m.user_id}
            </p>
            <p className="text-xs text-muted-foreground capitalize">{m.role}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Main Profile Page Component ─────────────────────────────────────────

export function ProfilePage() {
  const { teamId } = useParams({ from: "/dashboard/$teamId/profile" })
  const navigate = useNavigate()

  useEffect(() => {
    if (teamId) setStoredTeamId(teamId)
  }, [teamId])

  const { data: user, isLoading: userLoading } = useQuery(userQueries.me())
  const { data: projects = [], isLoading: projectsLoading } = useQuery(
    userQueries.myProjects()
  )
  const { data: allTasks = [], isLoading: tasksLoading } = useQuery(
    localProfileQueries.myTasks((user as any)?.id)
  )

  const enrichedTasks = allTasks.map((t) => ({
    ...t,
    project_name: projects.find((p) => p.id === t.project_id)?.name ?? "",
  }))
  const displayTasks = enrichedTasks
  const recentProjects = projects.slice(0, 6)

  const navigateWithTeamId = (to: string) => {
    navigate({ to: `/dashboard/${teamId}/${to}` })
  }

  if (userLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="mx-auto max-w-6xl">
          <Skeleton className="h-32 w-full" />
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl space-y-8 px-6 py-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-start md:items-center gap-6"
        >
          <div className="relative group">
            <Avatar name={(user as any).name ?? (user as any).email} size={96} className="ring-4 ring-background shadow-xl" />
          </div>

          <div className="min-w-0 flex-1 space-y-3">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                  {(user as any).name ?? (user as any).email}
                </h1>
              </div>
              <p className="text-muted-foreground mt-1">{(user as any).email}</p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <div className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                Member since {(user as any).created_at ? new Date((user as any).created_at).toLocaleDateString() : 'N/A'}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
          {/* Left column */}
          <div className="space-y-6">
            {/* My Tasks */}
            <div className="rounded-xl border border-border/50 bg-card p-4">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-medium text-foreground">
                    My Tasks
                  </h2>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-muted-foreground"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                </div>
                <button
                  onClick={() => navigateWithTeamId("tasks")}
                  className="rounded border border-border/60 px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted/50"
                >
                  View all tasks
                </button>
              </div>

              {tasksLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-4 w-4 rounded-full" />
                      <Skeleton className="h-4 flex-1" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  ))}
                </div>
              ) : displayTasks.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No assigned tasks
                </p>
              ) : (
                <div>
                  {displayTasks.slice(0, 8).map((task) => (
                    <TaskItem key={task.id} task={task} />
                  ))}
                  {displayTasks.length > 8 && (
                    <p className="mt-2 text-center text-xs text-muted-foreground">
                      +{displayTasks.length - 8} more tasks
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Recent Projects */}
            <div className="rounded-xl border border-border/50 bg-card p-4">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-medium text-foreground">
                  Recent Projects
                </h2>
                <span className="text-xs text-muted-foreground">
                  {projects.length} project{projects.length !== 1 ? "s" : ""}
                </span>
              </div>

              {projectsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-6 w-6 rounded" />
                      <Skeleton className="h-4 flex-1" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              ) : recentProjects.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No projects available
                </p>
              ) : (
                recentProjects.map((project) => (
                  <ProjectItem key={project.id} project={project} />
                ))
              )}
            </div>


          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Frequent collaborators */}
            <div className="rounded-xl border border-border/50 bg-card p-4">
              <div className="mb-4 flex items-center gap-2">
                <h2 className="text-sm font-medium text-foreground">
                  Frequent collaborators
                </h2>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-muted-foreground"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
              </div>
              {projectsLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-7 w-7 rounded-full" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  ))}
                </div>
              ) : (
                <CollaboratorsList
                  projects={recentProjects}
                  currentUserId={(user as any).id}
                />
              )}
            </div>

            {/* Quick stats */}
            <div className="rounded-xl border border-border/50 bg-card p-4">
              <h2 className="mb-4 text-sm font-medium text-foreground">
                Statistics
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <StatCard
                  label="Active projects"
                  value={projects.length}
                  color="#5c47f5"
                />
                <StatCard
                  label="Total tasks"
                  value={allTasks.length}
                  color="#4caf50"
                />
                <StatCard
                  label="Assigned tasks"
                  value={displayTasks.length}
                  color="#E5B800"
                />
                <StatCard
                  label="Overdue"
                  value={
                    displayTasks.filter(
                      (t) => t.due_date && new Date(t.due_date) < new Date()
                    ).length
                  }
                  color="#e53935"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

