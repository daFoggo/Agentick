import { useEffect, useState, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { DAYS_OF_WEEK, DISPLAY_ORDER_MON_SUN } from "@/constants/days"
import { cn } from "@/lib/utils"
import { CalendarRange, Settings2Icon } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { useParams } from "@tanstack/react-router"
import { userQueries } from "@/features/users"
import { 
  mySchedulesQueryOptions, 
  formatSchedules, 
  useScheduleMutations 
} from "../queries"
import { WorkTimePatternEditor } from "./work-time-pattern-editor"

export const WorkTimePattern = () => {
  const [mounted, setMounted] = useState(false)
  const params = useParams({ from: "/dashboard/$teamId/schedules/" })
  const teamId = params.teamId
  
  const { data: user } = useQuery(userQueries.me())
  const { data: rawSchedules, isLoading } = useQuery(mySchedulesQueryOptions())
  const { upsert } = useScheduleMutations()

  const schedules = useMemo(
    () => formatSchedules(rawSchedules, teamId, user?.id),
    [rawSchedules, teamId, user?.id]
  )
  const userId = user?.id

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || isLoading || !schedules) {
    return <Skeleton className="h-24 w-full rounded-xl" />
  }

  const calculateDuration = (start: string, end: string) => {
    const [sH, sM] = start.split(":").map(Number)
    const [eH, eM] = end.split(":").map(Number)
    return eH + eM / 60 - (sH + sM / 60)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex w-full cursor-pointer flex-col gap-4 rounded-xl p-2 text-left transition-all duration-300 hover:bg-muted">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarRange className="size-4" />
              <span className="text-sm font-semibold">Work Days</span>
            </div>
            <Settings2Icon className="size-4 text-muted-foreground transition-colors group-hover:text-foreground" />
          </div>

          <div className="flex w-full divide-x overflow-hidden rounded-lg border bg-muted/20">
            {DISPLAY_ORDER_MON_SUN.map((dayIndex) => {
              const day = schedules[dayIndex]
              const duration = calculateDuration(
                day.start_time || "00:00",
                day.end_time || "00:00"
              )
              const isFullDay = !day.is_off && duration >= 8
              const isPartialDay = !day.is_off && duration < 8

              return (
                <div
                  key={dayIndex}
                  className={cn(
                    "flex flex-1 flex-col items-center justify-center py-2 text-xs font-bold transition-colors",
                    day.is_off && "bg-muted/50 text-muted-foreground/30",
                    isFullDay && "bg-primary text-primary-foreground",
                    isPartialDay && "bg-primary/20 text-primary"
                  )}
                >
                  <span>{DAYS_OF_WEEK[dayIndex].short.slice(0, 2)}</span>
                </div>
              )
            })}
          </div>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:min-w-lg">
        <DialogHeader>
          <DialogTitle>Configure Work Days</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <WorkTimePatternEditor
            schedules={schedules}
            teamId={teamId}
            userId={userId}
            onUpdate={upsert}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
