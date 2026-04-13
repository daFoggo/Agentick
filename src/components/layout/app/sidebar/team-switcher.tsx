import { type ChartConfig, ChartContainer } from "@/components/ui/chart"
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import type { TTeam } from "@/features/teams"
import { teamQueries } from "@/features/teams"
import { useQuery } from "@tanstack/react-query"
import {
  CheckCircle2,
  ChevronsUpDown,
  GripVertical,
  Plus,
  Shapes,
} from "lucide-react"
import { Area, AreaChart } from "recharts"

const chartConfig = {
  tasks: {
    label: "Tasks",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

const MOCK_TEAMS: TTeam[] = [
  {
    id: "team-1",
    name: "Engineering",
    avatar_url: "https://api.dicebear.com/7.x/identicon/svg?seed=Engineering",
    owner_id: "user-1",
    created_at: new Date().toISOString(),
    members: [{}, {}, {}] as any,
  },
  {
    id: "team-2",
    name: "Marketing",
    avatar_url: "https://api.dicebear.com/7.x/identicon/svg?seed=Marketing",
    owner_id: "user-1",
    created_at: new Date().toISOString(),
    members: [{}, {}] as any,
  },
]

const TeamTile = ({ team, index }: { team: TTeam; index: number }) => {
  // Mock task performance data for the sparkline
  const data = Array.from({ length: 20 }, () => ({
    tasks: Math.floor(Math.random() * 50) + 5,
  }))

  const totalTasks = 12 + index * 5
  const completedTasks = 4 + index * 2
  const completionRate = Math.round((completedTasks / totalTasks) * 100)

  return (
    <div className="group relative border-t border-l border-dashed border-border transition-colors hover:bg-accent/50">
      <button className="flex h-auto w-full flex-col items-start justify-start rounded-none p-2.5 text-left font-normal">
        <div className="mb-2 flex w-full items-center gap-2">
          <div className="relative flex h-6 w-6 min-w-[24px] items-center justify-center overflow-hidden rounded-sm border border-white/10 bg-muted/50">
            {team.avatar_url ? (
              <img
                src={team.avatar_url}
                alt={team.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="text-[9px] font-bold text-muted-foreground uppercase">
                {team.name.slice(0, 2)}
              </div>
            )}
          </div>
          <div className="flex-1 truncate text-[13px] font-medium">
            {team.name}
          </div>
          <div className="ml-auto flex items-center gap-1">
            <kbd className="flex h-3.5 w-3.5 items-center justify-center rounded border border-border bg-muted text-[9px] text-muted-foreground group-hover:hidden">
              {index + 1}
            </kbd>
            <GripVertical className="hidden h-3 w-3 cursor-grab text-muted-foreground group-hover:block" />
          </div>
        </div>

        <div className="mb-1.5 h-[24px] w-full">
          <ChartContainer
            config={chartConfig}
            className="aspect-auto! h-full w-full"
          >
            <AreaChart data={data}>
              <defs>
                <linearGradient
                  id={`gradient-${team.id}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="var(--color-tasks)"
                    stopOpacity={0.3}
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
                fill={`url(#gradient-${team.id})`}
                isAnimationActive={false}
              />
            </AreaChart>
          </ChartContainer>
        </div>

        <div className="flex w-full items-center justify-between text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-foreground">{totalTasks}</span>
            <span>tasks</span>
          </div>
          <div className="flex items-center gap-1 font-medium text-emerald-500">
            <CheckCircle2 className="h-2.5 w-2.5" />
            {completionRate}%
          </div>
        </div>
      </button>
    </div>
  )
}

const EmptyTile = () => (
  <div className="flex h-full min-h-[90px] w-full items-center justify-center border-t border-l border-dashed border-border">
    <div className="rotate-45 text-muted-foreground/10">
      <Plus className="h-3.5 w-3.5" />
    </div>
  </div>
)

const CreateTeamTile = () => (
  <button className="group relative flex h-full min-h-[90px] flex-col items-center justify-center gap-1.5 rounded-none border-t border-l border-dashed border-border p-2 transition-colors hover:bg-accent/50">
    <div className="flex size-5 items-center justify-center rounded-sm border border-border bg-background transition-colors group-hover:border-primary group-hover:bg-primary">
      <Plus className="size-3.5 text-muted-foreground transition-colors group-hover:text-primary-foreground" />
    </div>
    <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground">
      New team
    </span>
  </button>
)

export const TeamSwitcher = () => {
  const { data: dbTeams } = useQuery(teamQueries.all())

  // Combine db teams with mock teams for demonstration
  const teams = [...(dbTeams ?? []), ...MOCK_TEAMS]

  // We want a 4x4 grid = 16 slots.
  // Last slot is ALWAYS CreateTeamTile.
  const totalSlots = 16
  const displayTeams = teams.slice(0, totalSlots - 1)
  const emptySlotsCount = Math.max(0, totalSlots - 1 - displayTeams.length)

  return (
    <SidebarMenuItem>
      <Popover>
        <PopoverTrigger asChild>
          <SidebarMenuButton>
            <div className="rounded-md bg-muted p-1">
              <Shapes />
            </div>
            <span className="text-sm font-medium">Project A</span>
            <SidebarMenuBadge>
              <ChevronsUpDown />
            </SidebarMenuBadge>
          </SidebarMenuButton>
        </PopoverTrigger>
        <PopoverContent align="start" side="bottom" className="w-[700px]">
          <div className="flex w-full items-center justify-between">
            <PopoverTitle>My Teams</PopoverTitle>
            <p className="text-xs font-medium text-muted-foreground">
              Statistics in this week
            </p>
          </div>

          <div className="grid grid-cols-4 overflow-hidden rounded-sm border-r border-b border-dashed border-border">
            {displayTeams.map((team, idx) => (
              <TeamTile key={team.id} team={team} index={idx} />
            ))}
            {Array.from({ length: emptySlotsCount }).map((_, idx) => (
              <EmptyTile key={`empty-${idx}`} />
            ))}
            <CreateTeamTile />
          </div>
        </PopoverContent>
      </Popover>
    </SidebarMenuItem>
  )
}
