import { ViewModeList } from "@/components/layout/app/view-mode-list"
import {
  TEAM_VIEW_MODE_CATALOG,
  buildViewModes,
} from "@/constants/view-mode-list"
import { TeamMemberList } from "@/features/team-members"
import { TeamDetailsHeader } from "@/features/teams"
import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"

const teamsSearchSchema = z.object({
  search: z.string().optional(),
})
const teamRenderers = {
  overview: () => <TeamOverviewView />,
  members: () => <TeamMemberList teamId="dynamic" />,
  settings: () => <TeamSettingsView />,
}

export const Route = createFileRoute("/dashboard/$teamId/team/")({
  validateSearch: (search) => teamsSearchSchema.parse(search),
  component: RouteComponent,
  staticData: {
    getTitle: () => "Team Details",
    header: {
      render: () => <HeaderWrapper />,
    },
    viewModeScope: "team",
    viewModes: buildViewModes(TEAM_VIEW_MODE_CATALOG, teamRenderers),
  },
})

function HeaderWrapper() {
  const { teamId } = Route.useParams()
  return <TeamDetailsHeader teamId={teamId} />
}

function RouteComponent() {
  const { teamId } = Route.useParams()
  const teamViewModes = buildViewModes(TEAM_VIEW_MODE_CATALOG, {
    overview: () => <TeamOverviewView />,
    members: () => <TeamMemberList teamId={teamId} />,
    settings: () => <TeamSettingsView />,
  })

  return (
    <div className="flex flex-col gap-4">
      <ViewModeList
        definitions={teamViewModes}
        scope="team"
        allowCustomization={false}
      />
    </div>
  )
}

function TeamOverviewView() {
  return (
    <div className="flex flex-col gap-4 py-8 text-center">
      <h3 className="text-lg font-medium">Team Overview</h3>
      <p className="text-muted-foreground">
        Summary of team activities and projects will appear here.
      </p>
    </div>
  )
}
function TeamSettingsView() {
  return (
    <div className="flex flex-col gap-4 py-8 text-center">
      <h3 className="text-lg font-medium">Team Settings</h3>
      <p className="text-muted-foreground">
        Configuration and team management options will appear here.
      </p>
    </div>
  )
}
