import React from "react"
import { cn } from "@/lib/utils"
import {
  CALENDAR_HOUR_HEIGHT,
  computeCalendarEventLayout,
  getCalendarEventsForDay,
  isSameCalendarDay,
} from "@/lib/big-calendar"
import type {
  IBigCalendarEvent,
  IBigCalendarEventLayout,
  IBigCalendarSlotInfo,
} from "@/types/big-calendar"
import { BigCalendarEventBlock } from "./big-calendar-event-block"
import { BigCalendarNowIndicator } from "./big-calendar-now-indicator"
import { BigCalendarTimeSlots } from "./big-calendar-time-slots"

interface IBigCalendarDayColumnProps {
  day: Date
  events: IBigCalendarEvent[]
  startHour?: number
  endHour?: number
  hourHeight?: number
  onSelectEvent?: (event: IBigCalendarEvent) => void
  onSelectSlot?: (slot: IBigCalendarSlotInfo) => void
  renderEvent?: (
    event: IBigCalendarEvent,
    layout: IBigCalendarEventLayout,
  ) => React.ReactNode
  slotClassName?: (date: Date, hour: number) => string
  className?: string
}

/**
 * Cột một ngày trong week view: gồm time slots + events positioned absolute.
 * Hiển thị now indicator nếu `day` là hôm nay.
 */
export function BigCalendarDayColumn({
  day,
  events,
  startHour = 0,
  endHour = 24,
  hourHeight = CALENDAR_HOUR_HEIGHT,
  onSelectEvent,
  onSelectSlot,
  renderEvent,
  slotClassName,
  className,
}: IBigCalendarDayColumnProps) {
  const now = new Date()
  const isToday = isSameCalendarDay(day, now)
  const nowHour = now.getHours()
  const showNowIndicator =
    isToday && nowHour >= startHour && nowHour < endHour

  const dayEvents = getCalendarEventsForDay(events, day)
  const layouts = computeCalendarEventLayout(
    dayEvents,
    day,
    startHour,
    endHour,
    hourHeight,
  )

  return (
    <div
      className={cn("relative min-w-0 flex-1 border-l border-border/50", className)}
    >
      {/* Clickable time slots background */}
      <BigCalendarTimeSlots
        day={day}
        startHour={startHour}
        endHour={endHour}
        hourHeight={hourHeight}
        onSelectSlot={onSelectSlot}
        slotClassName={slotClassName}
      />

      {/* Now indicator */}
      {showNowIndicator && (
        <BigCalendarNowIndicator
          startHour={startHour}
          hourHeight={hourHeight}
        />
      )}

      {/* Events */}
      {layouts.map((layout) => (
        <BigCalendarEventBlock
          key={layout.event.id}
          layout={layout}
          onClick={onSelectEvent}
          renderEvent={renderEvent}
        />
      ))}
    </div>
  )
}
