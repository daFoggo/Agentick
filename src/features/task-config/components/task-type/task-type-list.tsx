import { useQuery } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { DataTable } from "@/components/common/data-table";
import { Button } from "@/components/ui/button";
import { taskConfigQueries } from "../../queries";
import type { TTaskType } from "../../schemas";
import { CreateTaskTypeDialog } from "./create-task-type-dialog";
import { taskTypeColumns } from "./task-type-columns";

interface ITaskTypeListProps {
	projectId: string;
}

export const TaskTypeList = ({ projectId }: ITaskTypeListProps) => {
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const {
		data: typesData,
		isLoading,
		error,
	} = useQuery(
		taskConfigQueries.types(projectId, {
			page: 1,
			page_size: "all",
			ordering: "order",
		}),
	);
	const types = typesData?.founds ?? [];

	if (isLoading)
		return (
			<div className="flex h-32 w-full items-center justify-center">
				<Loader2 className="size-6 animate-spin text-muted-foreground" />
			</div>
		);
	if (error)
		return (
			<div className="flex h-32 w-full items-center justify-center text-destructive">
				Error loading task types
			</div>
		);

	return (
		<div className="space-y-4">
			<Button onClick={() => setIsCreateOpen(true)}>
				<Plus className="size-4" />
				New Type
			</Button>
			<DataTable<TTaskType>
				data={types}
				columns={taskTypeColumns}
				getRowId={(row) => row.id}
				showPagination={true}
				enablePagination={true}
				enableRowSelection={false}
				enableColumnReorder={false}
				enableColumnPinning={false}
			/>
			<CreateTaskTypeDialog
				projectId={projectId}
				open={isCreateOpen}
				onOpenChange={setIsCreateOpen}
			/>
		</div>
	);
};
