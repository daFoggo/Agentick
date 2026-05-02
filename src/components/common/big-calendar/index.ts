// ─── Root Component ───────────────────────────────────────────────────────────
export { BigCalendar } from "./big-calendar"
export { BigCalendarSkeleton } from "./big-calendar-skeleton"

// ─── Sub-components (composable) ─────────────────────────────────────────────
export { BigCalendarHeader } from "./components/header/big-calendar-header"
export { BigCalendarDayHeader } from "./components/header/big-calendar-day-header"
export { BigCalendarWeekView } from "./components/week-view/big-calendar-week-view"
export { BigCalendarDayColumn } from "./components/week-view/big-calendar-day-column"
export { BigCalendarTimeGutter } from "./components/week-view/big-calendar-time-gutter"
export { BigCalendarEventBlock, BigCalendarEventContent } from "./components/week-view/big-calendar-event-block"
export { BigCalendarEventPopover } from "./components/week-view/big-calendar-event-popover"
export { BigCalendarNowIndicator } from "./components/week-view/big-calendar-now-indicator"

// ─── Types (re-export từ global) ─────────────────────────────────────────────
export type {
  IBigCalendarProps,
  IBigCalendarEvent,
  IBigCalendarSlotInfo,
  IBigCalendarEventLayout,
  IBigCalendarStore,
  TCalendarView,
  TWeekStartDay,
} from "@/types/big-calendar"

// ─── Store ────────────────────────────────────────────────────────────────────
export {
  useBigCalendarStore,
  useCalendarView,
  useCalendarCurrentDate,
  useCalendarWeekStartsOn,
  useCalendarActions,
} from "@/stores/use-big-calendar-store"
