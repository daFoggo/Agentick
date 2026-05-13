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
					{getErrorMessage(error, "Failed to load task statuses.")}
				</AlertDescription>
			</Alert>
		);
	}

	if (statuses.length === 0) {
		return (
			<>
				<Empty>
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<Inbox className="size-4" />
						</EmptyMedia>
						<EmptyTitle>No statuses yet</EmptyTitle>
						<EmptyDescription>
							There are no task statuses configured for this project. Create a
							new status to get started.
						</EmptyDescription>
					</EmptyHeader>
					<EmptyContent>
						<Button onClick={() => setIsCreateOpen(true)}>
							<Plus className="size-4" />
							New Status
						</Button>
					</EmptyContent>
				</Empty>

				<CreateTaskStatusDialog
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
