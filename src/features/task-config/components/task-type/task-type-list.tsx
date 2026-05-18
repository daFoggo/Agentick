import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Inbox, Plus } from "lucide-react";
import { useState } from "react";
import { DataTable } from "@/components/common/data-table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/lib/error";
import { taskConfigQueries } from "../../queries";
import type { TTaskType } from "../../schemas";
import { CreateTaskTypeDialog } from "./create-task-type-dialog";
import { taskTypeColumns } from "./task-type-columns";

interface ITaskTypeListProps {
	projectId: string;
	canManageProject?: boolean;
}

export const TaskTypeList = ({
	projectId,
	canManageProject = true,
}: ITaskTypeListProps) => {
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

	if (isLoading) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-9 w-32" />
				<Skeleton className="h-64 w-full" />
			</div>
		);
	}

	if (error) {
		return (
			<Alert variant="destructive">
				<AlertCircle className="size-4" />
				<AlertTitle>Error</AlertTitle>
				<AlertDescription>
					{getErrorMessage(error, "Failed to load task types.")}
				</AlertDescription>
			</Alert>
		);
	}

	if (types.length === 0) {
		return (
			<>
				<Empty>
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<Inbox className="size-4" />
						</EmptyMedia>
						<EmptyTitle>No types yet</EmptyTitle>
						<EmptyDescription>
							There are no task types configured for this project. Create a new
							type to get started.
						</EmptyDescription>
					</EmptyHeader>
					{canManageProject && (
						<EmptyContent>
							<Button onClick={() => setIsCreateOpen(true)}>
								<Plus className="size-4" />
								New Type
							</Button>
						</EmptyContent>
					)}
				</Empty>

				{canManageProject && (
					<CreateTaskTypeDialog
						projectId={projectId}
						open={isCreateOpen}
						onOpenChange={setIsCreateOpen}
					/>
				)}
			</>
		);
	}

	return (
		<div className="space-y-4">
			{canManageProject && (
				<Button onClick={() => setIsCreateOpen(true)}>
					<Plus className="size-4" />
					New Type
				</Button>
			)}
			<DataTable<TTaskType>
				data={types}
				columns={
					canManageProject
						? taskTypeColumns
						: taskTypeColumns.filter((column) => column.id !== "actions")
				}
				getRowId={(row) => row.id}
				showPagination={true}
				enablePagination={true}
				enableRowSelection={false}
				enableColumnReorder={false}
				enableColumnPinning={false}
			/>
			{canManageProject && (
				<CreateTaskTypeDialog
					projectId={projectId}
					open={isCreateOpen}
					onOpenChange={setIsCreateOpen}
				/>
			)}
		</div>
	);
};
