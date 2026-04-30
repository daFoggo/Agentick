import { cn } from "@/lib/utils"
import type {
  IBigCalendarEvent,
  IBigCalendarEventLayout,
} from "@/types/big-calendar"
import React from "react"

interface IBigCalendarEventBlockProps {
  layout: IBigCalendarEventLayout
  onClick?: (event: IBigCalendarEvent) => void
  renderEvent?: (
    event: IBigCalendarEvent,
    layout: IBigCalendarEventLayout
  ) => React.ReactNode
}

// Padding giữa các event overlap (px)
const COLUMN_GAP = 2

/**
 * Absolute-positioned event block trong day column.
 * Tính width/left dựa trên column + totalColumns để xếp cạnh nhau.
 * Hỗ trợ renderEvent để feature custom toàn bộ nội dung.
 */
export function BigCalendarEventBlock({
  layout,
  onClick,
  renderEvent,
}: IBigCalendarEventBlockProps) {
  const { event, top, height, column, totalColumns } = layout

  const widthPercent = 100 / totalColumns
  const leftPercent = widthPercent * column

  // Dùng color từ event hoặc fallback về primary
  const accentColor = event.color ?? "var(--primary)"

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={event.title}
      onClick={() => onClick?.(event)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick?.(event)
      }}
      className={cn(
        "absolute overflow-hidden rounded-md focus-visible:outline-none",
        "transition-opacity duration-150 hover:opacity-90 focus-visible:ring-1 focus-visible:ring-ring",
        onClick ? "cursor-pointer" : "cursor-default"
      )}
      style={{
        top,
        height: Math.max(height - 1, 4),
        left: `calc(${leftPercent}% + ${COLUMN_GAP}px)`,
        width: `calc(${widthPercent}% - ${COLUMN_GAP * 2}px)`,
      }}
    >
      {renderEvent ? (
        renderEvent(event, layout)
      ) : (
        <DefaultEventContent
          event={event}
          accentColor={accentColor}
          height={height}
        />
      )}
    </div>
  )
}

// ─── Default event content ────────────────────────────────────────────────────

interface IDefaultEventContentProps {
  event: IBigCalendarEvent
  accentColor: string
  height: number
}

function DefaultEventContent({
  event,
  accentColor,
  height,
}: IDefaultEventContentProps) {
  const isCompact = height < 32

  return (
    <div
      className="flex h-full w-full flex-col overflow-hidden rounded-md border px-2 py-1.5 transition-all hover:brightness-95"
      style={{
        borderColor: `color-mix(in oklch, ${accentColor} 15%, transparent)`,
        backgroundColor: `color-mix(in oklch, ${accentColor} 25%, transparent)`,
      }}
    >
      <span
        className="truncate text-xs leading-tight font-bold tracking-tight"
        style={{ color: accentColor }}
      >
        {event.title}
      </span>

      {!isCompact && (
        <div className="mt-0.5 flex flex-col gap-0.5">
          <span
            className="truncate text-xs leading-none font-medium opacity-70"
            style={{ color: accentColor }}
          >
            {formatEventTime(event.start)}
          </span>
          {Boolean(event.meta?.location) && (
            <span
              className="truncate text-[10px] font-bold tracking-wider uppercase opacity-50"
              style={{ color: accentColor }}
            >
              {String(event.meta?.location)}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

function formatEventTime(date: Date): string {
  const h = date.getHours()
  const m = date.getMinutes()
  const ampm = h >= 12 ? "PM" : "AM"
  const hour = h % 12 || 12
  return m === 0
    ? `${hour} ${ampm}`
    : `${hour}:${String(m).padStart(2, "0")} ${ampm}`
}
