import { useQuery } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import { memo } from "react";
import { TaskStatusBadge } from "@/components/common/task-status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { projectRecentStatusUpdatesQueryOptions } from "../queries";
import type { TTaskActivity } from "../schemas";

function formatDateTime(date?: string | Date | null) {
	if (!date) return "-";
	return new Date(date).toLocaleString(undefined, {
		month: "short",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
	});
}

function getStatusTransition(task: TTaskActivity) {
	const from = task.old_status_name ?? "To Do";
	const to = task.new_status_name ?? "Unknown";
	return `${from} → ${to}`;
}

function getLatestStatusColor(task: TTaskActivity) {
	return task.new_status_color ?? task.old_status_color ?? "currentColor";
}

export const ProjectStatusUpdate = memo(
	({ projectId }: { projectId: string }) => {
		const { data: items = [], isLoading } = useQuery(
			projectRecentStatusUpdatesQueryOptions(projectId, 15),
		);

		return (
			<Card>
				<CardHeader>
					<CardTitle>Recent status updates</CardTitle>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="flex flex-col gap-4">
							{[1, 2, 3, 4].map((i) => (
								<div key={i} className="flex items-center justify-between py-2">
									<div className="space-y-2 flex-1">
										<Skeleton className="h-4 w-48" />
										<Skeleton className="h-5 w-24" />
									</div>
									<div className="space-y-2 shrink-0 text-right">
										<Skeleton className="h-3 w-28 ml-auto" />
										<Skeleton className="h-3 w-16 ml-auto" />
									</div>
								</div>
							))}
						</div>
					) : (
						<ScrollArea className="h-96 w-full">
							<div className="flex flex-col divide-y">
								{items.length === 0 ? (
									<Empty>
										<EmptyHeader>
											<EmptyMedia variant="icon">
												<AlertCircle className="size-4" />
											</EmptyMedia>
											<EmptyTitle>No updates this week</EmptyTitle>
											<EmptyDescription>
												Tasks haven't been updated yet this week. Check back
												later for status changes.
											</EmptyDescription>
										</EmptyHeader>
									</Empty>
								) : (
									items.map((it) => (
										<div
											key={it.id}
											className="flex items-start justify-between gap-4 py-2"
										>
											<div className="min-w-0 flex-1">
												<div className="truncate font-medium">
													{it.task_title}
												</div>
												<div className="mt-2 flex flex-wrap gap-1.5">
													{it.new_status_name ? (
														<TaskStatusBadge
															name={getStatusTransition(it)}
															color={getLatestStatusColor(it)}
														/>
													) : null}
												</div>
											</div>
											<div className="shrink-0 text-right text-xs text-muted-foreground">
												<div className="font-medium text-foreground">
													Updated by {it.user_name}
												</div>
												<div>{formatDateTime(it.created_at)}</div>
											</div>
										</div>
									))
								)}
							</div>
						</ScrollArea>
					)}
				</CardContent>
			</Card>
		);
	},
);

ProjectStatusUpdate.displayName = "ProjectStatusUpdate";

export default ProjectStatusUpdate;
