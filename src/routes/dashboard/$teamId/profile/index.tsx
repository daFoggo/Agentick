import { createFileRoute } from "@tanstack/react-router"

import { ProfileCard, userQueries } from "@/features/users"
import { MyProjectsList, myProjectsQueryOptions } from "@/features/projects"
import { MyTeamsList, teamQueries } from "@/features/teams"

export const Route = createFileRoute("/dashboard/$teamId/profile/")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(userQueries.me()),
      context.queryClient.ensureQueryData(myProjectsQueryOptions()),
      context.queryClient.ensureQueryData(teamQueries.myTeams()),
    ])
  },
  component: ProfileDashboardComponent,
  staticData: {
    getTitle: () => "My Profile",
  },
})

function ProfileDashboardComponent() {
  return (
    <div className="flex w-full flex-col gap-6">
      <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-12">
        <div className="flex flex-col gap-6 md:col-span-4 lg:col-span-3">
          <ProfileCard />
          <MyTeamsList />
        </div>

        <div className="flex flex-col gap-6 md:col-span-8 lg:col-span-9">
          <MyProjectsList />
        </div>
      </div>
    </div>
  )
}
