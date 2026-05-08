import { useQuery } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { DataTable } from "@/components/common/data-table";
import { Button } from "@/components/ui/button";
import { taskConfigQueries } from "../../queries";
import type { TTaskPriority } from "../../schemas";
import { CreateTaskPriorityDialog } from "./create-task-priority-dialog";
import { taskPriorityColumns } from "./task-priority-columns";

interface ITaskPriorityListProps {
	projectId: string;
}

export const TaskPriorityList = ({ projectId }: ITaskPriorityListProps) => {
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const {
		data: prioritiesData,
		isLoading,
		error,
	} = useQuery(
		taskConfigQueries.priorities(projectId, {
			page: 1,
			page_size: "all",
			ordering: "order",
		}),
	);
	const priorities = prioritiesData?.founds ?? [];

	if (isLoading)
		return (
			<div className="flex h-32 w-full items-center justify-center">
				<Loader2 className="size-6 animate-spin text-muted-foreground" />
			</div>
		);
	if (error)
		return (
			<div className="flex h-32 w-full items-center justify-center text-destructive">
				Error loading task priorities
			</div>
		);

	return (
		<div className="space-y-4">
			<Button onClick={() => setIsCreateOpen(true)}>
				<Plus className="size-4" />
				New Priority
			</Button>
			<DataTable<TTaskPriority>
				data={priorities}
				columns={taskPriorityColumns}
				getRowId={(row) => row.id}
				showPagination={true}
				enablePagination={true}
				enableRowSelection={false}
				enableColumnReorder={false}
				enableColumnPinning={false}
			/>
			<CreateTaskPriorityDialog
				projectId={projectId}
				open={isCreateOpen}
				onOpenChange={setIsCreateOpen}
			/>
		</div>
	);
};
