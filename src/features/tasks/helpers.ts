import type { TProjectMember } from "@/features/project-members"
import type {
  TTaskPriority as TTaskPriorityOption,
  TTaskStatus as TTaskStatusOption,
  TTaskType as TTaskTypeOption,
} from "@/features/task-config"
import type { TTask } from "./schemas"

/**
 * Interface cho các tùy chọn trong Dialog quản lý Task
 */
export interface ITaskListDialogOptions {
  statuses: TTaskStatusOption[]
  types: TTaskTypeOption[]
  priorities: TTaskPriorityOption[]
  members: TProjectMember[]
}

/**
 * Chuyển đổi giá trị sang đối tượng Date cho các Component lịch/ngày tháng
 */
export const toCalendarDateValue = (
  value?: string | Date | null
): Date | undefined => {
  if (!value) return undefined
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return undefined
  return date
}

/**
 * Chuyển đổi Date sang định dạng ISO string (có hỗ trợ thiết lập đầu/cuối ngày)
 */
export const toIsoDateTime = (
  value?: Date,
  options?: { endOfDay?: boolean; startOfDay?: boolean }
): string | undefined => {
  if (!value || Number.isNaN(value.getTime())) return undefined

  const date = new Date(value)

  if (options?.endOfDay) {
    date.setHours(23, 59, 59, 999)
  } else if (options?.startOfDay) {
    date.setHours(0, 0, 0, 0)
  }

  return date.toISOString()
}

/**
 * Định dạng Date hiển thị theo chuẩn Việt Nam (DD/MM/YYYY HH:mm)
 */
export const formatCalendarDate = (value?: Date): string => {
  if (!value || Number.isNaN(value.getTime())) return ""

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(value)
}

/**
 * Tìm kiếm các ID mặc định cho Status, Type, Priority từ danh sách Option
 */
export const resolveDefaultTaskOptionIds = (
  options: ITaskListDialogOptions
): {
  statusId: string
  typeId: string
  priorityId: string
  assignerId: string
} => {
  const statusId =
    options.statuses.find((item) => item.is_default)?.id ??
    options.statuses[0]?.id ??
    ""
  const typeId =
    options.types.find((item) => item.is_default)?.id ??
    options.types[0]?.id ??
    ""
  const priorityId =
    options.priorities.find((item) => item.is_default)?.id ??
    options.priorities[0]?.id ??
    ""
  const assignerId = options.members[0]?.id ?? ""

  return {
    statusId,
    typeId,
    priorityId,
    assignerId,
  }
}

/**
 * Lọc danh sách task theo trạng thái cho Dashboard Overview (Phương án B - Agile/Scrum).
 * - overdue:    task chưa hoàn thành, đã quá hạn chót (due_date < today)
 * - upcoming:   task chưa hoàn thành, chưa đến ngày bắt đầu (start_date > today)
 * - inProgress: task chưa hoàn thành, đang trong hạn hoặc không có hạn chót (start_date <= today <= due_date)
 */
export const filterTasksForOverview = (
  tasks: Partial<TTask>[],
  today: Date
) => {
  const isCompleted = (t: Partial<TTask>) => {
    const status = (t as { status?: { is_completed?: boolean } }).status
    return status?.is_completed === true
  }

  const todayTime = today.getTime()

  const getNormalizedTime = (dateValue?: string | Date | null) => {
    if (!dateValue) return null
    const d = new Date(dateValue)
    if (Number.isNaN(d.getTime())) return null
    d.setHours(0, 0, 0, 0)
    return d.getTime()
  }

  const overdue = tasks.filter((t) => {
    if (isCompleted(t)) return false
    const dueTime = getNormalizedTime(t.due_date)
    return dueTime !== null && dueTime < todayTime
  })

  const upcoming = tasks.filter((t) => {
    if (isCompleted(t)) return false
    const startTime = getNormalizedTime(t.start_date)
    return startTime !== null && startTime > todayTime
  })

  const inProgress = tasks.filter((t) => {
    if (isCompleted(t)) return false

    const dueTime = getNormalizedTime(t.due_date)
    const startTime = getNormalizedTime(t.start_date)

    const isOverdue = dueTime !== null && dueTime < todayTime
    const isUpcoming = startTime !== null && startTime > todayTime

    return !isOverdue && !isUpcoming
  })

  return { inProgress, upcoming, overdue }
}
