import {
  SidebarMenuBadge,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { type ChartConfig, ChartContainer } from "@/components/ui/chart"
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Link, useNavigate, useParams } from "@tanstack/react-router"
import {
  ChevronRight,
  FolderClosed,
  FolderOpen,
  Plus,
  CheckCircle2,
  TextAlignStart,
} from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { projectsQueryOptions } from "../queries"
import { Skeleton } from "@/components/ui/skeleton"
import { useMemo, useState } from "react"
import type { TProject } from "../schemas"
import { Area, AreaChart } from "recharts"
import { CreateProjectDialog } from "./create-project-dialog"

const VISIBLE_PROJECT_LIMIT = 2

const chartConfig = {
  tasks: {
    label: "Tasks",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

/**
 * Hiển thị danh sách các Project của Team trên thanh Sidebar.
 * Tự động đồng bộ trạng thái Active và các hiệu ứng Icon khi người dùng điều hướng.
 */
export const SidebarProjectList = () => {
  const navigate = useNavigate()
  const { teamId } = useParams({ strict: false }) as { teamId: string }
  const [isCreateProjectDialogOpen, setIsCreateProjectDialogOpen] =
    useState(false)

  const { data: projectsData, isLoading } = useQuery(
    projectsQueryOptions({ team_id__eq: teamId })
  )

  const projects = projectsData?.founds ?? []
  const visibleProjects = projects.slice(0, VISIBLE_PROJECT_LIMIT)
  const hasMoreProjects = projects.length > VISIBLE_PROJECT_LIMIT

  const handleProjectCreated = (project: TProject) => {
    navigate({
      to: "/dashboard/$teamId/projects/$projectId/dashboard",
      params: { teamId, projectId: project.id },
    })
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Projects</SidebarGroupLabel>
      <SidebarMenu className="gap-0.5">
        {isLoading &&
          Array.from({ length: 2 }).map((_, i) => (
            <SidebarMenuItem key={i}>
              <SidebarMenuButton disabled>
                <Skeleton className="size-4 shrink-0" />
                <Skeleton className="h-3.5 flex-1" />
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}

        {!isLoading && projects.length === 0 && (
          <div className="px-2 py-1 text-xs text-muted-foreground">
            No projects found
          </div>
        )}

        {!isLoading &&
          visibleProjects.map((project) => (
            <SidebarMenuItem key={project.id}>
              <Link
                to="/dashboard/$teamId/projects/$projectId"
                params={{ teamId: teamId!, projectId: project.id }}
              >
                {({ isActive }) => {
                  const Icon = isActive ? FolderOpen : FolderClosed
                  return (
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={project.name}
                    >
                      <Icon
                        className={cn(
                          "size-4 transition-colors",
                          isActive ? "text-primary" : "text-muted-foreground"
                        )}
                      />
                      <span
                        className={cn(
                          "truncate transition-colors",
                          isActive ? "text-foreground" : "text-muted-foreground"
                        )}
                      >
                        {project.name}
                      </span>
                    </SidebarMenuButton>
                  )
                }}
              </Link>
            </SidebarMenuItem>
          ))}

        {!isLoading && (
          <SidebarMenuItem>
            {hasMoreProjects ? (
              <MoreProjectsPopover
                projects={projects}
                teamId={teamId}
                onCreateProject={() => setIsCreateProjectDialogOpen(true)}
              />
            ) : (
              <SidebarMenuButton
                onClick={() => setIsCreateProjectDialogOpen(true)}
                tooltip="Create new project"
              >
                <Plus className="size-4" />
                <span>Create new project</span>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        )}
      </SidebarMenu>

      <CreateProjectDialog
        open={isCreateProjectDialogOpen}
        teamId={teamId}
        onOpenChange={setIsCreateProjectDialogOpen}
        onCreated={handleProjectCreated}
      />
    </SidebarGroup>
  )
}

const MoreProjectsPopover = ({
  projects,
  teamId,
  onCreateProject,
}: {
  projects: TProject[]
  teamId: string
  onCreateProject: () => void
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <SidebarMenuButton tooltip="More projects">
          <TextAlignStart className="size-4" />
          <span>More projects</span>
          <SidebarMenuBadge>
            <ChevronRight className="size-3.5" />
          </SidebarMenuBadge>
        </SidebarMenuButton>
      </PopoverTrigger>

      <PopoverContent
        side="right"
        align="start"
        sideOffset={8}
        className="w-84 gap-2 p-2"
      >
        <PopoverHeader className="px-1">
          <PopoverTitle>My projects</PopoverTitle>
        </PopoverHeader>

        <div className="max-h-76 space-y-1 overflow-y-auto pr-1">
          {projects.map((project, index) => (
            <ProjectListItem
              key={project.id}
              teamId={teamId}
              project={project}
              index={index}
            />
          ))}
        </div>

        <Button onClick={onCreateProject} className="mt-1 w-full" size="sm">
          <Plus className="size-4" />
          <span>Create new project</span>
        </Button>
      </PopoverContent>
    </Popover>
  )
}

const ProjectListItem = ({
  project,
  teamId,
  index,
}: {
  project: TProject
  teamId: string
  index: number
}) => {
  const data = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => ({
        tasks: ((index + 1) * 7 + i * 3) % 18 + 4,
      })),
    [index]
  )

  const totalTasks = 16 + index * 4
  const completedTasks = Math.min(totalTasks, 5 + index * 3)
  const completionRate = Math.round((completedTasks / totalTasks) * 100)

  return (
    <Link
      to="/dashboard/$teamId/projects/$projectId"
      params={{ teamId, projectId: project.id }}
      className="block rounded-md border border-transparent px-2 py-1.5 transition-colors hover:border-border hover:bg-accent"
    >
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="truncate text-xs font-semibold">{project.name}</span>
        <div className="flex items-center gap-1 text-[10px] font-medium text-emerald-600">
          <CheckCircle2 className="size-2.5" />
          {completionRate}%
        </div>
      </div>

      <div className="h-5 w-full">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <AreaChart data={data}>
            <defs>
              <linearGradient
                id={`project-gradient-${project.id}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="var(--color-tasks)"
                  stopOpacity={0.25}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-tasks)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="tasks"
              stroke="var(--color-tasks)"
              strokeWidth={1}
              fillOpacity={1}
              fill={`url(#project-gradient-${project.id})`}
              isAnimationActive={false}
            />
          </AreaChart>
        </ChartContainer>
      </div>
    </Link>
  )
}
