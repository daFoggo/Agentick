import { addDays, setHours, setMinutes, startOfToday, subDays } from "date-fns"
import type { IBigCalendarEvent } from "@/types/big-calendar"
import type { TEvent } from "@/features/events/schemas"
import { mapEventToCalendarEvent } from "@/features/events/utils"

const startOfTodayDate = startOfToday()

function todayAt(hours: number, minutes = 0) {
  return setMinutes(setHours(startOfTodayDate, hours), minutes)
}

const mockFeatureEvents: TEvent[] = [
  // ── Today (Complex Overlaps) ──────────────────────────────────────────
  {
    id: "mock-1",
    calendar_id: "cal-1",
    user_id: "user-1",
    team_id: "team-1",
    type: "meeting",
    title: "Product Sync",
    start_time: todayAt(9, 0),
    end_time: todayAt(10, 0),
    description: "Weekly sync up with the product team.",
  },
  {
    id: "mock-2",
    calendar_id: "cal-1",
    user_id: "user-1",
    team_id: "team-1",
    type: "task_block",
    title: "Code Review: Dashboard UI",
    start_time: todayAt(9, 30),
    end_time: todayAt(11, 30),
    task_id: "TASK-123",
  },
  {
    id: "mock-3",
    calendar_id: "cal-1",
    user_id: "user-1",
    team_id: "team-1",
    type: "focus_time",
    title: "Deep Work: Calendar Logic",
    start_time: todayAt(10, 0),
    end_time: todayAt(11, 0),
  },
  {
    id: "mock-4",
    calendar_id: "cal-1",
    user_id: "user-1",
    team_id: "team-1",
    type: "meeting",
    title: "Client Interview",
    start_time: todayAt(13, 0),
    end_time: todayAt(14, 0),
  },
  {
    id: "mock-5",
    calendar_id: "cal-1",
    user_id: "user-1",
    team_id: "team-1",
    type: "task_block",
    title: "Fix bug #452",
    start_time: todayAt(15, 0),
    end_time: todayAt(16, 30),
  },

  // ── Tomorrow ─────────────────────────────────────────────────────────────
  {
    id: "mock-6",
    calendar_id: "cal-1",
    user_id: "user-1",
    team_id: "team-1",
    type: "leave",
    title: "Personal Leave",
    start_time: addDays(todayAt(8, 0), 1),
    end_time: addDays(todayAt(17, 30), 1),
    description: "Family matters",
  },

  // ── Day After Tomorrow (With Overlap) ────────────────────────────────────
  {
    id: "mock-7",
    calendar_id: "cal-1",
    user_id: "user-1",
    team_id: "team-1",
    type: "task_block",
    title: "Write API Documentation",
    start_time: addDays(todayAt(10, 0), 2),
    end_time: addDays(todayAt(11, 30), 2),
  },
  {
    id: "mock-8",
    calendar_id: "cal-1",
    user_id: "user-1",
    team_id: "team-1",
    type: "meeting",
    title: "Marketing Team Sync",
    start_time: addDays(todayAt(14, 0), 2),
    end_time: addDays(todayAt(15, 0), 2),
  },
  {
    id: "mock-9",
    calendar_id: "cal-1",
    user_id: "user-1",
    team_id: "team-1",
    type: "focus_time",
    title: "Process Emails",
    start_time: addDays(todayAt(14, 30), 2),
    end_time: addDays(todayAt(16, 0), 2),
  },

  // ── Yesterday (With Overlap) ─────────────────────────────────────────────
  {
    id: "mock-10",
    calendar_id: "cal-1",
    user_id: "user-1",
    team_id: "team-1",
    type: "focus_time",
    title: "Research New Technologies",
    start_time: subDays(todayAt(10, 0), 1),
    end_time: subDays(todayAt(12, 0), 1),
  },
  {
    id: "mock-11",
    calendar_id: "cal-1",
    user_id: "user-1",
    team_id: "team-1",
    type: "meeting",
    title: "1:1 Manager",
    start_time: subDays(todayAt(15, 0), 1),
    end_time: subDays(todayAt(16, 0), 1),
  },
  {
    id: "mock-12",
    calendar_id: "cal-1",
    user_id: "user-1",
    team_id: "team-1",
    type: "task_block",
    title: "Refactor Legacy Code",
    start_time: subDays(todayAt(15, 30), 1),
    end_time: subDays(todayAt(16, 30), 1),
  },

  // ── Two Days Ago ─────────────────────────────────────────────────────────
  {
    id: "mock-13",
    calendar_id: "cal-1",
    user_id: "user-1",
    team_id: "team-1",
    type: "meeting",
    title: "Sprint Retrospective",
    start_time: subDays(todayAt(9, 0), 2),
    end_time: subDays(todayAt(10, 0), 2),
  },
  {
    id: "mock-14",
    calendar_id: "cal-1",
    user_id: "user-1",
    team_id: "team-1",
    type: "task_block",
    title: "Prepare Demo Slides",
    start_time: subDays(todayAt(11, 0), 2),
    end_time: subDays(todayAt(12, 30), 2),
  },
]

export const mockCalendarEvents: IBigCalendarEvent[] = mockFeatureEvents.map(
  mapEventToCalendarEvent
)
