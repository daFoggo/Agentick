import { useQuery } from "@tanstack/react-query"
import { useNavigate, useParams } from "@tanstack/react-router"
import { Briefcase, FolderGit2 } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

import { myProjectsQueryOptions } from "@/features/projects/queries"

export function MyProjectsList() {
  const navigate = useNavigate()
  const { teamId } = useParams({ strict: false })

  const { data: projects = [], isLoading } = useQuery(myProjectsQueryOptions())

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <FolderGit2 className="size-4 text-muted-foreground" />
          <span>My Projects</span>
        </CardTitle>
        <div className="rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
          {projects.length}
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
            <Briefcase className="mb-2 size-8 text-muted-foreground/30" />
            <p className="text-sm">You haven't joined any projects yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {projects.map((project) => (
              <div
                key={project.id}
                role="button"
                tabIndex={0}
                className="flex cursor-pointer flex-col gap-1.5 rounded-lg border bg-muted p-2 transition-colors hover:bg-muted/80"
                onClick={() =>
                  navigate({
                    to: "/dashboard/$teamId/projects/$projectId/list",
                    params: {
                      teamId: teamId || "personal",
                      projectId: project.id,
                    },
                  })
                }
              >
                <div className="flex items-center justify-between">
                  <span className="truncate text-sm font-medium">
                    {project.name}
                  </span>
                  <span className="shrink-0 rounded bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground uppercase border">
                    Open
                  </span>
                </div>
                <p className="line-clamp-1 text-xs text-muted-foreground">
                  {project.description || "Building amazing things."}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
