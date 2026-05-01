import { Coffee, Focus, ListTodo, Video, type LucideIcon } from "lucide-react"
import type { TEventType } from "./schemas"

export interface IEventTypeOption {
  value: TEventType
  label: string
  icon: LucideIcon
  colorClass: string
  bgClass: string
  calendarColor: string
}

export const EVENT_TYPE_OPTIONS: IEventTypeOption[] = [
  {
    value: "task",
    label: "Task",
    icon: ListTodo,
    colorClass: "text-blue-500",
    bgClass: "bg-blue-500/20",
    calendarColor: "#3b82f6", // blue-500
  },
  {
    value: "meeting",
    label: "Meeting",
    icon: Video,
    colorClass: "text-green-500",
    bgClass: "bg-green-500/20",
    calendarColor: "#22c55e", // green-500
  },
  {
    value: "focus_time",
    label: "Focus Time",
    icon: Focus,
    colorClass: "text-amber-500",
    bgClass: "bg-amber-500/20",
    calendarColor: "#f59e0b", // amber-500
  },
  {
    value: "leave",
    label: "Leave",
    icon: Coffee,
    colorClass: "text-rose-500",
    bgClass: "bg-rose-500/20",
    calendarColor: "#f43f5e", // rose-500
  },
]
