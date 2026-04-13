import { Skeleton } from "@/components/ui/skeleton"
import { TeamsHeader } from "@/features/teams"
import { createFileRoute } from "@tanstack/react-router"
import { Suspense } from "react"
import { z } from "zod"

const teamsSearchSchema = z.object({
  search: z.string().optional(),
})

export const Route = createFileRoute("/dashboard/team/")({
  validateSearch: (search) => teamsSearchSchema.parse(search),
  component: RouteComponent,
  staticData: {
    getTitle: () => "Teams",
    header: {
      render: () => <TeamsHeader />,
    },
  },
})

function RouteComponent() {
  return (
    <div className="flex w-full flex-col gap-4">
      <Suspense fallback={<TeamListSkeleton />}></Suspense>
    </div>
  )
}

function TeamListSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-10 w-80" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48 w-full rounded-xl" />
        ))}
      </div>
    </div>
  )
}
