import { Coffee, Focus, ListTodo, Video, type LucideIcon } from "lucide-react"
import type { TEventType } from "./schemas"

export interface IEventTypeOption {
  value: TEventType
  label: string
  icon: LucideIcon
  colorClass: string
  calendarColor: string
}

export const EVENT_TYPE_OPTIONS: IEventTypeOption[] = [
  {
    value: "task_block",
    label: "Task",
    icon: ListTodo,
    colorClass: "text-blue-500",
    calendarColor: "#3b82f6", // blue-500
  },
  {
    value: "meeting",
    label: "Meeting",
    icon: Video,
    colorClass: "text-green-500",
    calendarColor: "#22c55e", // green-500
  },
  {
    value: "focus_time",
    label: "Focus Time",
    icon: Focus,
    colorClass: "text-amber-500",
    calendarColor: "#f59e0b", // amber-500
  },
  {
    value: "leave",
    label: "Leave",
    icon: Coffee,
    colorClass: "text-rose-500",
    calendarColor: "#f43f5e", // rose-500
  },
]
