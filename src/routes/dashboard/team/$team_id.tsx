import { createFileRoute } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import { teamQueries } from "@/features/teams"
import { MemberList } from "@/features/team-members"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Users, LayoutDashboard, Settings } from "lucide-react"

export const Route = createFileRoute("/dashboard/team/$team_id")({
  component: TeamDetailComponent,
  staticData: {
    getTitle: () => "Team Details",
  },
})

function TeamDetailComponent() {
  const { team_id } = Route.useParams()
  const { data: team } = useSuspenseQuery(teamQueries.detail(team_id))

  return (
    <div className="mx-auto max-w-7xl animate-in space-y-8 p-6 duration-700 fade-in slide-in-from-bottom-4">
      {/* Header Profile Section */}
      <section className="relative">
        <div className="absolute inset-0 -z-10 rounded-3xl bg-linear-to-r from-primary/5 to-transparent" />
        <div className="flex flex-col items-start justify-between gap-6 p-4 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <Avatar className="size-16 border-4 border-background shadow-xl">
              <AvatarImage src={team?.avatar_url} />
              <AvatarFallback className="bg-primary/10 text-xl font-bold text-primary">
                {team?.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <h1 className="text-3xl font-bold tracking-tight">
                {team?.name}
              </h1>
              <p className="text-muted-foreground">
                {team?.description || "No description provided."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="px-3 py-1 text-xs">
              ID: {team?.id}
            </Badge>
            <Button variant="outline" size="sm" className="gap-2">
              <Settings className="size-4" /> Edit Team
            </Button>
          </div>
        </div>
      </section>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-8 bg-muted/50 p-1">
          <TabsTrigger value="overview" className="gap-2">
            <LayoutDashboard className="size-4" /> Overview
          </TabsTrigger>
          <TabsTrigger value="members" className="gap-2">
            <Users className="size-4" /> Members
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="overview"
          className="space-y-6 focus-visible:outline-none"
        >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Quick Stats */}
            <Card className="border-border/50 bg-background/50 backdrop-blur-sm md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">About Team</CardTitle>
                <CardDescription>
                  General information and purpose of this team?.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {team?.description ||
                    "Describe what this team is all about to help members understand its goals."}
                </p>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarDays className="size-4 text-primary" />
                    <span>Created {team?.created_at}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="size-4 text-primary" />
                    <span>Active Collaboration</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sidebar info */}
            <div className="space-y-6">
              <Card className="border-border/50 bg-background/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold">
                    Metadata
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Created On
                      </p>
                      <p className="text-sm font-medium">{team?.created_at}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Team ID</p>
                      <p className="font-mono text-xs">{team?.id}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="members" className="focus-visible:outline-none">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight">Team Members</h2>
              <Button size="sm" className="gap-2">
                <Plus className="size-4" /> Add Member
              </Button>
            </div>
            <MemberList teamId={team_id} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function Button({ children, ...props }: any) {
  return <button {...props}>{children}</button>
}

function Plus({ className }: any) {
  return <Users className={className} />
}
