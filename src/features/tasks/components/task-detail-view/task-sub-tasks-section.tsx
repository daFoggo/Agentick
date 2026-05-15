import { useNavigate, useParams } from "@tanstack/react-router";
import { CalendarDays, GitBranch, ListTree, Plus } from "lucide-react";
import { TaskPriorityBadge } from "@/components/common/task-priority-badge";
import { TaskStatusBadge } from "@/components/common/task-status-badge";
import { TaskTypeBadge } from "@/components/common/task-type-badge";
import { Button } from "@/components/ui/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import {
	formatCalendarDate,
	type ITaskListDialogOptions,
	type TTask,
} from "@/features/tasks";

interface TaskSubTasksSectionProps {
	task?: TTask;
	options: ITaskListDialogOptions;
}

const getOptionById = <T extends { id: string; name: string; color?: string }>(
	items: Array<T>,
	id: string,
) => items.find((item) => item.id === id);

export function TaskSubTasksSection({
	task,
	options,
}: TaskSubTasksSectionProps) {
	const navigate = useNavigate();
	const { teamId, projectId } = useParams({ strict: false });

	if (!task) return null;

	const subTasks = task.sub_tasks ?? [];
	const targetTeamId = teamId || "personal";
	const targetProjectId = projectId || task.project_id;

	const navigateToCreateSubTask = () => {
		navigate({
			to: "/dashboard/$teamId/projects/$projectId/tasks/create",
			params: {
				teamId: targetTeamId,
				projectId: targetProjectId,
			},
			search: {
				parent_id: task.id,
				parent_task_id: task.id,
				redirect_to: "task",
			} as any,
		});
	};

	const navigateToSubTask = (subTask: TTask) => {
		navigate({
			to: "/dashboard/$teamId/projects/$projectId/tasks/$taskId",
			params: {
				teamId: targetTeamId,
				projectId: subTask.project_id || targetProjectId,
				taskId: subTask.id,
			},
			search: {
				parent_task_id: task.id,
				redirect_to: "task",
			} as any,
		});
	};

	return (
		<section data-slot="task-sub-tasks-section" className="space-y-3">
			<div className="flex items-center justify-between gap-3">
				<div className="flex items-center gap-2">
					<ListTree className="size-4 text-muted-foreground" />
					<h2 className="text-sm font-medium">Sub-tasks</h2>
					<span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
						{subTasks.length}
					</span>
				</div>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={navigateToCreateSubTask}
				>
					<Plus className="size-4" />
					Add sub-task
				</Button>
			</div>

			{subTasks.length === 0 ? (
				<Empty className="min-h-44 border border-dashed shadow-none">
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<GitBranch />
						</EmptyMedia>
						<EmptyTitle>No sub-tasks yet</EmptyTitle>
						<EmptyDescription>
							Break this task into smaller trackable work items.
						</EmptyDescription>
					</EmptyHeader>
					<EmptyContent>
						<Button type="button" size="sm" onClick={navigateToCreateSubTask}>
							<Plus className="size-4" />
							Create sub-task
						</Button>
					</EmptyContent>
				</Empty>
			) : (
				<div className="divide-y rounded-lg border">
					{subTasks.map((subTask) => {
						const status = getOptionById(options.statuses, subTask.status_id);
						const type = getOptionById(options.types, subTask.type_id);
						const priority = getOptionById(
							options.priorities,
							subTask.priority_id,
						);

						return (
							<button
								key={subTask.id}
								type="button"
								className="flex w-full items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
								onClick={() => navigateToSubTask(subTask)}
							>
								<GitBranch className="size-4 shrink-0 text-muted-foreground" />
								<div className="min-w-0 flex-1 space-y-2">
									<div className="truncate text-sm font-medium">
										{subTask.title}
									</div>
									<div className="flex flex-wrap items-center gap-2">
										<TaskStatusBadge
											name={status?.name || "Unknown"}
											color={status?.color}
											className="max-w-32"
										/>
										{type ? (
											<TaskTypeBadge
												name={type.name}
												color={type.color}
												typeVariant="subtle"
												className="max-w-32"
											/>
										) : null}
										{priority ? (
											<TaskPriorityBadge
												name={priority.name}
												color={priority.color}
												className="max-w-32"
											/>
										) : null}
									</div>
								</div>
								<div className="hidden shrink-0 items-center gap-1.5 text-xs text-muted-foreground sm:flex">
									<CalendarDays className="size-3.5" />
									{subTask.due_date
										? formatCalendarDate(new Date(subTask.due_date))
										: "No due date"}
								</div>
							</button>
						);
					})}
				</div>
			)}
		</section>
	);
}
