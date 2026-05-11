import { useNavigate, useParams } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useMemo } from "react";
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
	const navigate = useNavigate();
	const { teamId } = useParams({ strict: false });

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

	return (
		<div className="space-y-4">
			<Button
				onClick={() =>
					navigate({
						to: "/dashboard/$teamId/projects/$projectId/tasks/create",
						params: { teamId: teamId || "personal", projectId },
					})
				}
			>
				<Plus className="size-4" />
				New Task
			</Button>

			<DataTable<TTask>
				data={data}
				columns={columns}
				getRowId={(row) => row.id}
				onRowClick={(row) =>
					navigate({
						to: "/dashboard/$teamId/projects/$projectId/tasks/$taskId",
						params: { teamId: teamId || "all", projectId, taskId: row.id },
					})
				}
				defaultGrouping={groupBy ? [groupBy] : []}
				defaultColumnPinning={{
					left: ["select", "title"],
					right: ["actions"],
				}}
				enableRowSelection={true}
				defaultPageSize={defaultPageSize}
				enablePagination={false}
			/>
		</div>
	);
};
