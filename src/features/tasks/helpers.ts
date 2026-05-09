import type { TProjectMember } from "@/features/project-members";
import type {
	TTaskPriority as TTaskPriorityOption,
	TTaskStatus as TTaskStatusOption,
	TTaskType as TTaskTypeOption,
} from "@/features/task-config";
import type { TTask } from "./schemas";

/**
 * Interface cho các tùy chọn trong Dialog quản lý Task
 */
export interface ITaskListDialogOptions {
	statuses: TTaskStatusOption[];
	types: TTaskTypeOption[];
	priorities: TTaskPriorityOption[];
	members: TProjectMember[];
}

export function getStatusOption(
	value: string,
	options: ITaskListDialogOptions,
) {
	const normalizedValue = value.toLowerCase().replace(/[^a-z0-9]+/g, "");
	return options.statuses.find((s) => {
		const normalizedCatalogValue = s.name
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "");
		const normalizedLabel = s.name.toLowerCase().replace(/[^a-z0-9]+/g, "");
		return (
			normalizedCatalogValue === normalizedValue ||
			normalizedLabel === normalizedValue
		);
	});
}

export function getPriorityOption(
	value: string,
	options: ITaskListDialogOptions,
) {
	const normalizedValue = value.toLowerCase().replace(/[^a-z0-9]+/g, "");
	return options.priorities.find((p) => {
		const normalizedCatalogValue = p.name
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "");
		const normalizedLabel = p.name.toLowerCase().replace(/[^a-z0-9]+/g, "");
		return (
			normalizedCatalogValue === normalizedValue ||
			normalizedLabel === normalizedValue
		);
	});
}

export function getTypeOption(value: string, options: ITaskListDialogOptions) {
	const normalizedValue = value.toLowerCase().replace(/[^a-z0-9]+/g, "");
	return options.types.find((t) => {
		const normalizedCatalogValue = t.name
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "");
		const normalizedLabel = t.name.toLowerCase().replace(/[^a-z0-9]+/g, "");
		return (
			normalizedCatalogValue === normalizedValue ||
			normalizedLabel === normalizedValue
		);
	});
}

/**
 * Chuyển đổi giá trị sang đối tượng Date cho các Component lịch/ngày tháng
 */
export const toCalendarDateValue = (
	value?: string | Date | null,
): Date | undefined => {
	if (!value) return undefined;
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return undefined;
	return date;
};

/**
 * Chuyển đổi Date sang định dạng ISO string (có hỗ trợ thiết lập đầu/cuối ngày)
 */
export const toIsoDateTime = (
	value?: Date,
	options?: { endOfDay?: boolean; startOfDay?: boolean },
): string | undefined => {
	if (!value || Number.isNaN(value.getTime())) return undefined;

	const date = new Date(value);

	if (options?.endOfDay) {
		date.setHours(23, 59, 59, 999);
	} else if (options?.startOfDay) {
		date.setHours(0, 0, 0, 0);
	}

	return date.toISOString();
};

/**
 * Định dạng Date hiển thị theo chuẩn Việt Nam (DD/MM/YYYY HH:mm)
 */
export const formatCalendarDate = (value?: Date): string => {
	if (!value || Number.isNaN(value.getTime())) return "";

	return new Intl.DateTimeFormat("vi-VN", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	}).format(value);
};

/**
 * Tìm kiếm các ID mặc định cho Status, Type, Priority từ danh sách Option
 */
export const resolveDefaultTaskOptionIds = (
	options: ITaskListDialogOptions,
): {
	statusId: string;
	typeId: string;
	priorityId: string;
	assignerId: string;
} => {
	const statusId =
		options.statuses.find((item) => item.is_default)?.id ??
		options.statuses[0]?.id ??
		"";
	const typeId =
		options.types.find((item) => item.is_default)?.id ??
		options.types[0]?.id ??
		"";
	const priorityId =
		options.priorities.find((item) => item.is_default)?.id ??
		options.priorities[0]?.id ??
		"";
	const assignerId = options.members[0]?.id ?? "";

	return {
		statusId,
		typeId,
		priorityId,
		assignerId,
	};
};

/**
 * Lọc danh sách task theo trạng thái cho Dashboard Overview (Phương án B - Agile/Scrum).
 * - overdue:    task chưa hoàn thành, đã quá hạn chót (due_date < today)
 * - upcoming:   task chưa hoàn thành, chưa đến ngày bắt đầu (start_date > today)
 * - inProgress: task chưa hoàn thành, đang trong hạn hoặc không có hạn chót (start_date <= today <= due_date)
 */
export const filterTasksForOverview = (
	tasks: Partial<TTask>[],
	today: Date,
) => {
	const isCompleted = (t: Partial<TTask>) => {
		const status = (t as { status?: { is_completed?: boolean } }).status;
		return status?.is_completed === true;
	};

	const todayTime = today.getTime();

	const getNormalizedTime = (dateValue?: string | Date | null) => {
		if (!dateValue) return null;
		const d = new Date(dateValue);
		if (Number.isNaN(d.getTime())) return null;
		d.setHours(0, 0, 0, 0);
		return d.getTime();
	};

	const overdue = tasks.filter((t) => {
		if (isCompleted(t)) return false;
		const dueTime = getNormalizedTime(t.due_date);
		return dueTime !== null && dueTime < todayTime;
	});

	const upcoming = tasks.filter((t) => {
		if (isCompleted(t)) return false;
		const startTime = getNormalizedTime(t.start_date);
		return startTime !== null && startTime > todayTime;
	});

	const inProgress = tasks.filter((t) => {
		if (isCompleted(t)) return false;

		const dueTime = getNormalizedTime(t.due_date);
		const startTime = getNormalizedTime(t.start_date);

		const isOverdue = dueTime !== null && dueTime < todayTime;
		const isUpcoming = startTime !== null && startTime > todayTime;

		return !isOverdue && !isUpcoming;
	});

	return { inProgress, upcoming, overdue };
};

export function mapTaskData(
	task: any,
	members: TProjectMember[],
	options: {
		statuses: Array<{ id: string; name: string; color?: string }>;
		types: Array<{ id: string; name: string; color?: string }>;
		priorities: Array<{ id: string; name: string; color?: string }>;
	},
): TTask {
	const assignee_ids =
		task.assignee_ids || (task.assignee_id ? [task.assignee_id] : []);
	const assignees = members.filter((m) => assignee_ids.includes(m.id));

	const display = (
		id: string,
		catalog: Array<{ id: string; name: string; color?: string }>,
	) => catalog.find((item) => item.id === id);

	const typeOpt = display(task.type_id, options.types);
	const statusOpt = display(task.status_id, options.statuses);
	const priorityOpt = display(task.priority_id, options.priorities);

	return {
		id: task.id,
		project_id: task.project_id,
		parent_id: null,
		title: task.title,
		description: task.description ?? null,
		status_id: task.status_id,
		type_id: task.type_id,
		priority_id: task.priority_id,
		assigner_id: task.assigner_id || "",
		type: typeOpt?.name ?? task.type_id,
		status: statusOpt?.name ?? task.status_id,
		priority: priorityOpt?.name ?? task.priority_id,
		type_color: typeOpt?.color,
		status_color: statusOpt?.color,
		priority_color: priorityOpt?.color,
		phase_id: task.phase_id ?? null,
		assignee_ids,
		assignees,
		start_date: task.start_date
			? new Date(task.start_date).toISOString()
			: new Date().toISOString(),
		due_date: task.due_date
			? new Date(task.due_date).toISOString()
			: new Date().toISOString(),
		created_at: task.created_at
			? new Date(task.created_at).toISOString()
			: new Date().toISOString(),
		updated_at: task.updated_at
			? new Date(task.updated_at).toISOString()
			: new Date().toISOString(),
		order: task.order ?? 0,
		is_archived: !!task.is_archived,
		is_deleted: !!task.is_deleted,
		estimated_hours:
			task.estimated_hours != null ? Number(task.estimated_hours) : undefined,
		actual_hours:
			task.actual_hours != null ? Number(task.actual_hours) : undefined,
	};
}
