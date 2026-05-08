import { useQuery } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { DataTable } from "@/components/common/data-table";
import { Button } from "@/components/ui/button";
import { taskConfigQueries } from "../../queries";
import type { TTaskStatus } from "../../schemas";
import { CreateTaskStatusDialog } from "./create-task-status-dialog";
import { taskStatusColumns } from "./task-status-columns";

interface ITaskStatusListProps {
	projectId: string;
}

/**
 * Thành phần hiển thị danh sách tất cả các trạng thái (status) của task trong project.
 */
export const TaskStatusList = ({ projectId }: ITaskStatusListProps) => {
	const [isCreateOpen, setIsCreateOpen] = useState(false);

	const {
		data: statusesData,
		isLoading,
		error,
	} = useQuery(
		taskConfigQueries.statuses(projectId, {
			page: 1,
			page_size: "all",
			ordering: "order",
		}),
	);

	const statuses = statusesData?.founds ?? [];

	if (isLoading) {
		return (
			<div className="flex h-32 w-full items-center justify-center">
				<Loader2 className="size-6 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex h-32 w-full items-center justify-center text-destructive">
				Error loading task statuses
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<Button onClick={() => setIsCreateOpen(true)}>
				<Plus className="size-4" />
				New Status
			</Button>

			<DataTable<TTaskStatus>
				data={statuses}
				columns={taskStatusColumns}
				getRowId={(row) => row.id}
				showPagination={true}
				enablePagination={true}
				enableRowSelection={false}
				enableColumnReorder={false}
				enableColumnPinning={false}
			/>

			<CreateTaskStatusDialog
				projectId={projectId}
				open={isCreateOpen}
				onOpenChange={setIsCreateOpen}
			/>
		</div>
	);
};
