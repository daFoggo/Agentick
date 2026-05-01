import React from "react"
import { cn } from "@/lib/utils"
import {
  CALENDAR_DEFAULT_END_HOUR,
  CALENDAR_DEFAULT_START_HOUR,
  CALENDAR_HOUR_HEIGHT,
  getCalendarWeekDays,
} from "@/lib/big-calendar"
import {
  useCalendarCurrentDate,
  useCalendarWeekStartsOn,
} from "@/stores/use-big-calendar-store"
import type {
  IBigCalendarEvent,
  IBigCalendarEventLayout,
  IBigCalendarSlotInfo,
} from "@/types/big-calendar"
import { BigCalendarDayHeader } from "../header/big-calendar-day-header"
import { BigCalendarTimeGutter } from "./big-calendar-time-gutter"
import { BigCalendarDayColumn } from "./big-calendar-day-column"

interface IBigCalendarWeekViewProps {
  events: IBigCalendarEvent[]
  startHour?: number
  endHour?: number
  hourHeight?: number
  onSelectEvent?: (event: IBigCalendarEvent) => void
  onSelectSlot?: (slot: IBigCalendarSlotInfo) => void
  renderEvent?: (
    event: IBigCalendarEvent,
    layout: IBigCalendarEventLayout
  ) => React.ReactNode
  slotClassName?: (date: Date, hour: number) => string
  scrollToHour?: number
  className?: string
}

/**
 * Week view: header row + scrollable time grid.
 *
 * Layout:
 * ┌──────┬──────────────────────────────────┐
 * │ gtr  │ Sun | Mon | Tue | … | Sat       │  ← Day headers (sticky)
 * ├──────┼──────────────────────────────────┤
 * │ 0:00 │     |     |     |   |            │
 * │ 1:00 │     |  ██ |     |   |            │  ← Scrollable
 * │ …    │     |     |     |   |            │
 * └──────┴──────────────────────────────────┘
 */
export function BigCalendarWeekView({
  events,
  startHour = CALENDAR_DEFAULT_START_HOUR,
  endHour = CALENDAR_DEFAULT_END_HOUR,
  hourHeight = CALENDAR_HOUR_HEIGHT,
  onSelectEvent,
  onSelectSlot,
  renderEvent,
  slotClassName,
  className,
  scrollToHour,
}: IBigCalendarWeekViewProps) {
  const currentDate = useCalendarCurrentDate()
  const weekStartsOn = useCalendarWeekStartsOn()
  const weekDays = getCalendarWeekDays(currentDate, weekStartsOn)
  const scrollContainerRef = React.useRef<HTMLDivElement>(null)

  // Chiều cao tổng của grid
  const totalGridHeight = (endHour - startHour) * hourHeight

  // Auto scroll khi mount hoặc khi scrollToHour thay đổi
  React.useEffect(() => {
    if (
      scrollToHour !== undefined &&
      scrollContainerRef.current &&
      scrollToHour >= startHour &&
      scrollToHour <= endHour
    ) {
      const scrollOffset = (scrollToHour - startHour) * hourHeight
      scrollContainerRef.current.scrollTop = scrollOffset
    }
  }, [scrollToHour, startHour, endHour, hourHeight])

  return (
    <div
      className={cn("flex min-h-0 flex-1 flex-col overflow-hidden", className)}
    >
      {/* ── Sticky day header row ── */}
      <div className="flex shrink-0 border-b bg-card">
        {/* Spacer căn với time gutter */}
        <div className="w-14 shrink-0" />
        {/* Day headers */}
        {weekDays.map((day) => (
          <div
            key={day.toISOString()}
            className="min-w-0 flex-1 border-l border-border/50"
          >
            <BigCalendarDayHeader date={day} />
          </div>
        ))}
      </div>

      {/* ── Scrollable time grid ── */}
      <div
        ref={scrollContainerRef}
        className="no-scrollbar flex min-h-0 flex-1 overflow-y-auto"
      >
        {/* Time gutter */}
        <BigCalendarTimeGutter
          startHour={startHour}
          endHour={endHour}
          hourHeight={hourHeight}
        />

        {/* Day columns — explicit height để border-l đúng toàn grid */}
        <div
          className="flex min-w-0 flex-1"
          style={{ height: totalGridHeight }}
        >
          {weekDays.map((day) => (
            <BigCalendarDayColumn
              key={day.toISOString()}
              day={day}
              events={events}
              startHour={startHour}
              endHour={endHour}
              hourHeight={hourHeight}
              onSelectEvent={onSelectEvent}
              onSelectSlot={onSelectSlot}
              renderEvent={renderEvent}
              slotClassName={slotClassName}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
