import { cn } from "@/lib/utils"
import {
  CALENDAR_HOUR_HEIGHT,
  getCalendarTimeSlots,
} from "@/lib/big-calendar"
import type { IBigCalendarSlotInfo } from "@/types/big-calendar"

interface IBigCalendarTimeSlotsProps {
  day: Date
  startHour?: number
  endHour?: number
  hourHeight?: number
  onSelectSlot?: (slot: IBigCalendarSlotInfo) => void
  slotClassName?: (date: Date, hour: number) => string
  className?: string
}

/**
 * Lưới các ô giờ trong một ngày.
 * Mỗi ô = 1 giờ. Click vào ô → trigger onSelectSlot.
 */
export function BigCalendarTimeSlots({
  day,
  startHour = 0,
  endHour = 24,
  hourHeight = CALENDAR_HOUR_HEIGHT,
  onSelectSlot,
  slotClassName,
  className,
}: IBigCalendarTimeSlotsProps) {
  const slots = getCalendarTimeSlots(startHour, endHour)

  const handleSlotClick = (hour: number) => {
    if (!onSelectSlot) return
    const start = new Date(day)
    start.setHours(hour, 0, 0, 0)
    const end = new Date(day)
    end.setHours(hour + 1, 0, 0, 0)
    onSelectSlot({
      start,
      end,
      dayOfWeek: day.getDay(),
    })
  }

  return (
    <div
      className={cn("relative w-full", className)}
      style={{ height: (endHour - startHour) * hourHeight }}
    >
      {slots.map(({ hour }) => (
        <div
          key={hour}
          role={onSelectSlot ? "button" : undefined}
          tabIndex={onSelectSlot ? 0 : undefined}
          onClick={() => handleSlotClick(hour)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") handleSlotClick(hour)
          }}
          className={cn(
            "absolute left-0 right-0 border-t border-border/50",
            onSelectSlot &&
              "cursor-pointer transition-colors hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:outline-none",
            slotClassName?.(day, hour)
          )}
          style={{
            top: (hour - startHour) * hourHeight,
            height: hourHeight,
          }}
        />
      ))}
    </div>
  )
}
