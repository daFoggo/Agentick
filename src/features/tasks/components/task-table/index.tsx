import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/common/data-table";
import { Button } from "@/components/ui/button";
import type { TProjectMember } from "@/features/project-members";
import type {
	TTaskPriority as TTaskPriorityOption,
	TTaskStatus as TTaskStatusOption,
	TTaskType as TTaskTypeOption,
} from "@/features/task-config";
import type { TTask } from "@/features/tasks";
import { getTaskColumns } from "./columns";
import { CreateTaskListDialog } from "./create-task-list-dialog";

interface ITaskTableProps {
	projectId: string;
	data: TTask[];
	members: TProjectMember[];
	statuses: TTaskStatusOption[];
	types: TTaskTypeOption[];
	priorities: TTaskPriorityOption[];
	groupBy?: string;
	defaultPageSize?: number;
}

/**
 * Bảng hiển thị danh sách công việc (Task).
 * Hỗ trợ các tính năng cao cấp như nhóm dữ liệu (Grouping), ghim cột (Pinning) và phân trang.
 */
export const TaskTable = ({
	projectId,
	data,
	members,
	statuses,
	types,
	priorities,
	groupBy,
	defaultPageSize = 20,
}: ITaskTableProps) => {
	const [isCreateOpen, setIsCreateOpen] = useState(false);

	const tableOptions = useMemo(
		() => ({
			members,
			statuses,
			types,
			priorities,
		}),
		[members, statuses, types, priorities],
	);

	const columns = useMemo(() => getTaskColumns(tableOptions), [tableOptions]);

	const nextOrder = useMemo(
		() =>
			data.reduce(
				(maxOrder, item) => Math.max(maxOrder, item.order ?? -1),
				-1,
			) + 1,
		[data],
	);

	return (
		<div className="space-y-4">
			<Button onClick={() => setIsCreateOpen(true)}>
				<Plus className="size-4" />
				New Task
			</Button>

			<DataTable<TTask>
				data={data}
				columns={columns}
				getRowId={(row) => row.id}
				defaultGrouping={groupBy ? [groupBy] : []}
				defaultColumnPinning={{
					left: ["select", "title"],
					right: ["actions"],
				}}
				enableRowSelection={true}
				defaultPageSize={defaultPageSize}
				enablePagination={false}
			/>

			<CreateTaskListDialog
				projectId={projectId}
				nextOrder={nextOrder}
				open={isCreateOpen}
				onOpenChange={setIsCreateOpen}
				options={tableOptions}
			/>
		</div>
	);
};
