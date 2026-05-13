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
import type { TTaskTag } from "../../schemas";
import { CreateTaskTagDialog } from "./create-task-tag-dialog";
import { taskTagColumns } from "./task-tag-columns";

interface ITaskTagListProps {
	projectId: string;
}

export const TaskTagList = ({ projectId }: ITaskTagListProps) => {
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const {
		data: tagsData,
		isLoading,
		error,
	} = useQuery(
		taskConfigQueries.tags(projectId, {
			page: 1,
			page_size: "all",
			ordering: "name",
		}),
	);
	const tags = tagsData?.founds ?? [];

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
					{getErrorMessage(error, "Failed to load task tags.")}
				</AlertDescription>
			</Alert>
		);
	}

	if (tags.length === 0) {
		return (
			<>
				<Empty>
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<Inbox className="size-4" />
						</EmptyMedia>
						<EmptyTitle>No tags yet</EmptyTitle>
						<EmptyDescription>
							There are no task tags configured for this project. Create a new
							tag to get started.
						</EmptyDescription>
					</EmptyHeader>
					<EmptyContent>
						<Button onClick={() => setIsCreateOpen(true)}>
							<Plus className="size-4" />
							New Tag
						</Button>
					</EmptyContent>
				</Empty>

				<CreateTaskTagDialog
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
				New Tag
			</Button>
			<DataTable<TTaskTag>
				data={tags}
				columns={taskTagColumns}
				getRowId={(row) => row.id}
				showPagination={true}
				enablePagination={true}
				enableRowSelection={false}
				enableColumnReorder={false}
				enableColumnPinning={false}
			/>
			<CreateTaskTagDialog
				projectId={projectId}
				open={isCreateOpen}
				onOpenChange={setIsCreateOpen}
			/>
		</div>
	);
};
