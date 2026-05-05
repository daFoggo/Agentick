import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MOCK_USER_WORKLOAD } from "@/features/projects/mocks"
import { Search } from "lucide-react"
import * as React from "react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

type UserSeries = {
  userId: string
  name: string
  week: { period: string; value: number }[]
  month: { period: string; value: number }[]
}

export function ProjectWorkload() {
  const [mode, setMode] = React.useState<"week" | "month">("week")
  const [searchTerm, setSearchTerm] = React.useState("")

  // compute global max for the selected mode so all charts share the same Y domain
  const allValues = MOCK_USER_WORKLOAD.flatMap((u) =>
    (mode === "week" ? u.week : u.month).map(
      (p: { period: string; value: number }) => p.value
    )
  )
  const globalMax = Math.max(1, ...allValues)
  const ticks = [0, Math.ceil(globalMax / 2), globalMax]

  // Filter users by search term
  const filteredUsers = MOCK_USER_WORKLOAD.filter((u) =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <CardTitle className="shrink-0">Member workloads</CardTitle>
            <InputGroup>
              <InputGroupAddon align="inline-start">
                <Search className="size-3.5" />
              </InputGroupAddon>
              <InputGroupInput
                placeholder="Search members"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-xs"
              />
            </InputGroup>
          </div>
          <ButtonGroup orientation="horizontal">
            <Button
              size="sm"
              variant={mode === "week" ? "default" : "outline"}
              onClick={() => setMode("week")}
            >
              Weekly
            </Button>
            <Button
              size="sm"
              variant={mode === "month" ? "default" : "outline"}
              onClick={() => setMode("month")}
            >
              Monthly
            </Button>
          </ButtonGroup>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96 w-full">
          <div className="flex flex-col divide-y">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((u: UserSeries) => {
                // Select data based on mode, then filter month to only show days with value > 0
                const baseData = mode === "week" ? u.week : u.month
                const displayData =
                  mode === "month"
                    ? baseData.filter((p) => p.value > 0)
                    : baseData
                return (
                  <div key={u.userId} className="flex items-center gap-2 py-2">
                    <div className="min-w-24">
                      <div className="text-sm font-medium">{u.name}</div>
                      <div className="text-xs text-muted-foreground">
                        Team member
                      </div>
                    </div>
                    <div className="flex-1">
                      <ChartContainer
                        id={`workload-${u.userId}`}
                        className="aspect-auto"
                        config={{
                          value: { label: "Tasks", color: "var(--chart-1)" },
                        }}
                        style={{ height: 112 }}
                      >
                        <LineChart
                          data={displayData}
                          margin={{ left: 0, right: 12, top: 8, bottom: 8 }}
                        >
                          <CartesianGrid
                            vertical={true}
                            strokeDasharray="3 3"
                          />
                          <XAxis
                            dataKey="period"
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(v) => {
                              try {
                                const d = new Date(v)
                                if (mode === "week") {
                                  return d.toLocaleDateString(undefined, {
                                    weekday: "short",
                                  })
                                }
                                return String(d.getDate()).padStart(2, "0")
                              } catch {
                                return String(v)
                              }
                            }}
                          />
                          <YAxis
                            width={44}
                            axisLine={false}
                            tickLine={false}
                            domain={[0, globalMax]}
                            ticks={ticks}
                          />
                          <ChartTooltip
                            content={
                              <ChartTooltipContent
                                labelKey="period"
                                nameKey="value"
                                indicator="dot"
                              />
                            }
                          />
                          <Line
                            dataKey="value"
                            stroke="var(--chart-1)"
                            strokeWidth={2}
                            dot={false}
                          />
                        </LineChart>
                      </ChartContainer>
                    </div>
                  </div>
                )
              })
            ) : (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Search className="size-4" />
                  </EmptyMedia>
                  <EmptyTitle>No team members found</EmptyTitle>
                  <EmptyDescription>
                    Try adjusting your search or filter to find what you're
                    looking for.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

export default ProjectWorkload
