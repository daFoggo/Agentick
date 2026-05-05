import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { userQueries } from "@/features/users"
import { useSuspenseQuery } from "@tanstack/react-query"
import { startOfToday } from "date-fns"
import { MOCK_TASKS } from "../../constants"
import { filterTasksForOverview } from "../../helpers"
import { TaskList } from "./task-list"

/**
 * TaskLine component - Orchestrates the personal tasks widget on Dashboard Overview
 */
export const TaskLine = () => {
  const { data: user } = useSuspenseQuery(userQueries.me())

  const today = startOfToday()
  const { inProgress, upcoming, overdue } = filterTasksForOverview(
    MOCK_TASKS,
    today
  )

  const initials =
    user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "??"

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <Tabs defaultValue="progress" className="flex flex-1 flex-col">
        <CardHeader className="flex flex-col">
          <div className="flex items-center gap-2">
            <Avatar>
              {user.avatar_url && <AvatarImage src={user.avatar_url} />}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <CardTitle className="text-xl font-semibold">My Tasks</CardTitle>
            </div>
          </div>
          <TabsList variant="line" className="h-auto">
            <TabsTrigger value="progress">In Progress</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="overdue" className="items-center text-center">
              Overdue
              <span className="ml-1.5 text-xs text-muted-foreground">
                {overdue.length}
              </span>
            </TabsTrigger>
          </TabsList>
        </CardHeader>
        <CardContent className="mt-2 flex min-h-0 flex-1 flex-col px-2">
          <TabsContent value="progress" className="min-h-0 flex-1">
            <TaskList tasks={inProgress} />
          </TabsContent>
          <TabsContent value="upcoming" className="min-h-0 flex-1">
            <TaskList tasks={upcoming} />
          </TabsContent>
          <TabsContent value="overdue" className="min-h-0 flex-1">
            <TaskList tasks={overdue} />
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  )
}
