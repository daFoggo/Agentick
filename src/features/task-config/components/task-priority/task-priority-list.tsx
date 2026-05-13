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
					{getErrorMessage(error, "Failed to load task priorities.")}
				</AlertDescription>
			</Alert>
		);
	}

	if (priorities.length === 0) {
		return (
			<>
				<Empty>
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<Inbox className="size-4" />
						</EmptyMedia>
						<EmptyTitle>No priorities yet</EmptyTitle>
						<EmptyDescription>
							There are no task priorities configured for this project. Create a
							new priority to get started.
						</EmptyDescription>
					</EmptyHeader>
					<EmptyContent>
						<Button onClick={() => setIsCreateOpen(true)}>
							<Plus className="size-4" />
							New Priority
						</Button>
					</EmptyContent>
				</Empty>

				<CreateTaskPriorityDialog
					projectId={projectId}
					open={isCreateOpen}
					onOpenChange={setIsCreateOpen}
				/>
			</>
		);
	}

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
