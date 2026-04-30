import {
  BigCalendar,
  BigCalendarSkeleton,
} from "@/components/common/big-calendar"
import {
  CreateEventButton,
  EventTypeFilter,
  EVENT_TYPE_OPTIONS,
} from "@/features/events"
import { mockCalendarEvents } from "@/features/schedules/mocks/calendar-events.mock"
import { mySchedulesQueryOptions, WorkTimePattern } from "@/features/schedules"
import { useSchedulesData } from "@/features/schedules/hooks"
import { userQueries } from "@/features/users"
import { createFileRoute } from "@tanstack/react-router"
import { useState, useMemo, useEffect } from "react"

export const Route = createFileRoute("/dashboard/$teamId/schedules/")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(mySchedulesQueryOptions()),
      context.queryClient.ensureQueryData(userQueries.me()),
    ])
  },
  component: RouteComponent,
  staticData: {
    getTitle: () => "Schedules",
    fixedHeight: true,
  },
})

function RouteComponent() {
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>(
    EVENT_TYPE_OPTIONS.map((opt) => opt.value)
  )
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const { schedules } = useSchedulesData()

  const filteredEvents = useMemo(() => {
    return mockCalendarEvents.filter((event) => {
      if (!event.meta?.type) return true
      return selectedEventTypes.includes(event.meta.type as string)
    })
  }, [selectedEventTypes])

  const getSlotClassName = (date: Date, hour: number) => {
    if (!schedules) return ""
    // date.getDay() trả về 0 (Sun) -> 6 (Sat)
    const scheduleDay = schedules[date.getDay()]

    // Nếu là ngày off hoàn toàn
    if (!scheduleDay || scheduleDay.is_off) return "bg-stripes"

    // Tính toán khoảng thời gian làm việc
    const startH = scheduleDay.start_time
      ? parseInt(scheduleDay.start_time.split(":")[0])
      : 0
    const endH = scheduleDay.end_time
      ? parseInt(scheduleDay.end_time.split(":")[0])
      : 24

    // Nếu giờ hiện tại nằm ngoài khoảng làm việc
    if (hour < startH || hour >= endH) {
      return "bg-stripes"
    }

    return ""
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-card shadow-sm md:flex-row">
        {/* Left Side */}
        <section className="no-scrollbar flex min-h-0 flex-col gap-4 overflow-y-auto border-r bg-card p-2 md:w-64 md:shrink-0">
          <CreateEventButton />
          <WorkTimePattern />
          <EventTypeFilter
            value={selectedEventTypes}
            onChange={setSelectedEventTypes}
          />
        </section>

        {/* Right Side — BigCalendar */}
        <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {isMounted ? (
            <BigCalendar
              events={filteredEvents}
              weekStartsOn={1}
              startHour={6}
              endHour={22}
              headerClassName="p-4"
              slotClassName={getSlotClassName}
            />
          ) : (
            <BigCalendarSkeleton headerClassName="p-4" />
          )}
        </section>
      </div>
    </div>
  )
}
