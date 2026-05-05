import { useQuery } from "@tanstack/react-query"
import { useNavigate, useParams } from "@tanstack/react-router"
import { ArrowRight, Briefcase, FolderClosed, Plus } from "lucide-react"
import { useState } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { myProjectsQueryOptions } from "@/features/projects/queries"

import { CreateProjectDialog } from "./create-project-dialog"

export function MyProjectsGrid() {
  const navigate = useNavigate()
  const { teamId } = useParams({ strict: false })
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const { data: projects = [], isLoading } = useQuery(myProjectsQueryOptions())

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderClosed className="size-4 text-muted-foreground" />
            <span>Projects</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Projects
          <Badge variant="secondary" className="font-mono">
            {projects.length}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="px-2">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {/* New Project Button */}
          <button
            onClick={() => setIsCreateOpen(true)}
            className="group flex items-center gap-2 rounded-lg p-2 transition-all hover:bg-muted"
          >
            <div className="flex size-8 items-center justify-center rounded-lg border border-dashed border-muted-foreground/20 bg-muted/30 group-hover:border-primary/50 group-hover:bg-primary/5 group-hover:text-primary">
              <Plus className="size-5" />
            </div>
            <span className="text-sm font-medium text-muted-foreground group-hover:text-primary">
              New Project
            </span>
          </button>

          {projects.slice(0, 7).map((project) => {
            const tasksDueSoon = project.tasks?.length ?? 0

            return (
              <button
                key={project.id}
                onClick={() =>
                  navigate({
                    to: "/dashboard/$teamId/projects/$projectId/list",
                    params: {
                      teamId: teamId || "personal",
                      projectId: project.id,
                    },
                  })
                }
                className="group flex items-center gap-2 rounded-lg p-2 transition-all hover:bg-muted"
              >
                <Avatar>
                  <AvatarImage
                    src={project.avatar_url || ""}
                    className="object-cover"
                  />
                  <AvatarFallback>
                    <FolderClosed className="size-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start overflow-hidden text-left">
                  <span className="max-w-full truncate font-medium transition-colors group-hover:text-primary">
                    {project.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {tasksDueSoon} tasks due soon
                  </span>
                </div>
                <ArrowRight className="ml-auto size-4 -translate-x-2 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
              </button>
            )
          })}
        </div>

        {projects.length === 0 && !isLoading && (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Briefcase />
              </EmptyMedia>
              <EmptyTitle>No projects yet</EmptyTitle>
              <EmptyDescription>
                Start by creating your first project.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </CardContent>

      <CreateProjectDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        teamId={teamId || "personal"}
      />
    </Card>
  )
}
