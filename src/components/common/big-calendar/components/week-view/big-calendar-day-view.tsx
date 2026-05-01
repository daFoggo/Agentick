import React from "react"
import { cn } from "@/lib/utils"
import {
  CALENDAR_DEFAULT_END_HOUR,
  CALENDAR_DEFAULT_START_HOUR,
  CALENDAR_HOUR_HEIGHT,
} from "@/lib/big-calendar"
import { useCalendarCurrentDate } from "@/stores/use-big-calendar-store"
import type {
  IBigCalendarEvent,
  IBigCalendarEventLayout,
  IBigCalendarSlotInfo,
} from "@/types/big-calendar"
import { format } from "date-fns"
import { BigCalendarDayColumn } from "./big-calendar-day-column"
import { BigCalendarTimeGutter } from "./big-calendar-time-gutter"

interface IBigCalendarDayViewProps {
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
 * Day view: hiển thị 1 ngày với full-width column.
 * Layout giống week view nhưng chỉ có 1 cột ngày.
 */
export function BigCalendarDayView({
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
}: IBigCalendarDayViewProps) {
  const currentDate = useCalendarCurrentDate()
  const scrollContainerRef = React.useRef<HTMLDivElement>(null)
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
      {/* ── Sticky day header ── */}
      <div className="flex shrink-0 border-b bg-card">
        <div className="w-14 shrink-0" />
        <div className="flex min-w-0 flex-1 items-center justify-center border-l border-border/50 py-2">
          <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {format(currentDate, "EEE")}
          </span>
          <span className="ml-1 text-xs font-semibold text-foreground">
            {format(currentDate, "d")}
          </span>
        </div>
      </div>

      {/* ── Scrollable grid ── */}
      <div
        ref={scrollContainerRef}
        className="no-scrollbar flex min-h-0 flex-1 overflow-y-auto"
      >
        <BigCalendarTimeGutter
          startHour={startHour}
          endHour={endHour}
          hourHeight={hourHeight}
        />
        <div
          className="flex min-w-0 flex-1"
          style={{ height: totalGridHeight }}
        >
          <BigCalendarDayColumn
            day={currentDate}
            events={events}
            startHour={startHour}
            endHour={endHour}
            hourHeight={hourHeight}
            onSelectEvent={onSelectEvent}
            onSelectSlot={onSelectSlot}
            renderEvent={renderEvent}
            slotClassName={slotClassName}
          />
        </div>
      </div>
    </div>
  )
}
