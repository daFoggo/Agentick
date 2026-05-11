import { useNavigate, useParams } from "@tanstack/react-router";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { MemberAvatarGroup } from "@/components/common/member-avatar-group";
import { TaskPriorityBadge } from "@/components/common/task-priority-badge";
import { TaskStatusBadge } from "@/components/common/task-status-badge";
import { TaskTypeBadge } from "@/components/common/task-type-badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { TTask } from "@/features/tasks";
import {
	formatCalendarDate,
	getPriorityOption,
	getStatusOption,
	getTypeOption,
	type ITaskListDialogOptions,
} from "@/features/tasks/helpers";
import { useTaskMutations } from "@/features/tasks/queries";
import { generateColumns } from "@/lib/data-table";
import { DeleteTaskListDialog } from "./delete-task-list-dialog";

const TaskListActionCell = ({ task }: { task: TTask }) => {
	const { remove } = useTaskMutations();
	const navigate = useNavigate();
	const params = useParams({ strict: false });
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);

	const handleDelete = async (): Promise<boolean> => {
		try {
			await remove.mutateAsync({
				projectId: task.project_id,
				taskId: task.id,
			});
			return true;
		} catch (error) {
			console.error("Failed to delete task:", error);
			return false;
		}
	};

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						size="icon"
						className="size-7"
						onClick={(e) => e.stopPropagation()}
					>
						<MoreHorizontal className="size-4" />
						<span className="sr-only">Open actions</span>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuItem
						onClick={() =>
							navigate({
								to: "/dashboard/$teamId/projects/$projectId/tasks/$taskId",
								params: {
									teamId: params.teamId || "personal",
									projectId: task.project_id,
									taskId: task.id,
								},
							})
						}
					>
						<Pencil className="size-4" />
						Edit / View Details
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						variant="destructive"
						onClick={() => setIsDeleteOpen(true)}
					>
						<Trash2 className="size-4" />
						Delete
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<DeleteTaskListDialog
				task={task}
				open={isDeleteOpen}
				onOpenChange={setIsDeleteOpen}
				isPending={remove.isPending}
				onConfirm={handleDelete}
			/>
		</>
	);
};

export const getTaskColumns = (options: ITaskListDialogOptions) =>
	generateColumns<TTask>([
		{
			accessorKey: "title",
			label: "Title",
			size: 250,
			enablePinning: true,
			cell: ({ getValue }) => {
				return (
					<span
						className="block max-w-full truncate text-sm font-medium text-foreground"
						title={getValue() as string}
					>
						{getValue() as string}
					</span>
				);
			},
		},

		{
			accessorKey: "type",
			label: "Type",
			size: 110,
			cell: ({ getValue, row }) => {
				const task = row.original;
				const { update } = useTaskMutations();
				const type = getTypeOption(getValue() as string, options);
				if (!type) return null;

				return (
					<TaskTypeBadge
						name={type.name}
						color={type.color}
						interactive
						options={options.types}
						value={type.id}
						onValueChange={async (newId) => {
							try {
								await update.mutateAsync({
									projectId: task.project_id,
									taskId: task.id,
									payload: { type_id: newId },
								});
								toast.success("Type updated");
							} catch (_error) {
								toast.error("Failed to update type");
							}
						}}
					/>
				);
			},
		},

		{
			accessorKey: "status",
			label: "Status",
			size: 130,
			renderGroupValue: (value: string) => {
				const option = getStatusOption(value, options);
				return (
					<>
						{option && (
							<span
								className="size-2 shrink-0 rounded-full"
								style={{ backgroundColor: option.color }}
							/>
						)}
						<span className="text-xs font-semibold tracking-wider text-foreground/80 uppercase">
							{option?.name ?? value}
						</span>
					</>
				);
			},
			cell: ({ getValue, row }) => {
				const task = row.original;
				const { update } = useTaskMutations();
				const status = getStatusOption(getValue() as string, options);
				if (!status) return null;

				return (
					<TaskStatusBadge
						name={status.name}
						color={status.color}
						interactive
						options={options.statuses}
						value={status.id}
						onValueChange={async (newId) => {
							try {
								await update.mutateAsync({
									projectId: task.project_id,
									taskId: task.id,
									payload: { status_id: newId },
								});
							} catch (_error) {
								toast.error("Failed to update status");
							}
						}}
					/>
				);
			},
		},

		{
			accessorKey: "priority",
			label: "Priority",
			size: 120,
			renderGroupValue: (value: string) => {
				const option = getPriorityOption(value, options);
				return (
					<>
						{option && (
							<span
								className="size-2 shrink-0 rounded-full"
								style={{ backgroundColor: option.color }}
							/>
						)}
						<span className="text-xs font-semibold tracking-wider text-foreground/80 uppercase">
							{option?.name ?? value}
						</span>
					</>
				);
			},
			cell: ({ getValue, row }) => {
				const task = row.original;
				const { update } = useTaskMutations();
				const priority = getPriorityOption(getValue() as string, options);
				if (!priority) return null;

				return (
					<TaskPriorityBadge
						name={priority.name}
						color={priority.color}
						interactive
						options={options.priorities}
						value={priority.id}
						onValueChange={async (newId) => {
							try {
								await update.mutateAsync({
									projectId: task.project_id,
									taskId: task.id,
									payload: { priority_id: newId },
								});
							} catch (_error) {
								toast.error("Failed to update priority");
							}
						}}
					/>
				);
			},
		},

		{
			accessorKey: "task_members",
			label: "Members",
			size: 150,
			cell: ({ getValue }) => {
				const members = getValue() as TTask["task_members"];
				if (!members || members.length === 0)
					return (
						<span className="text-xs text-muted-foreground">Unassigned</span>
					);
				return (
					<MemberAvatarGroup
						items={members}
						max={3}
						size="sm"
						getAvatarInfo={(m) => ({
							id: m.user_id,
							name: m.user?.name,
							avatar_url: m.user?.avatar_url,
						})}
					/>
				);
			},
		},

		{
			accessorKey: "due_date",
			label: "Due Date",
			size: 112,
			cell: ({ getValue }) => {
				const date = getValue() as string;
				if (!date) return <span className="text-muted-foreground">—</span>;
				const isPast = new Date(date) < new Date();
				return (
					<span className={isPast ? "text-xs text-destructive" : "text-xs"}>
						{formatCalendarDate(new Date(date))}
					</span>
				);
			},
		},

		{
			accessorKey: "estimated_hours",
			label: "Estimated hours",
			header: "Est. (h)",
			size: 80,
			headerClassName: "text-right",
			cellClassName: "text-right tabular-nums",
			cell: ({ getValue }) => {
				const v = getValue();
				return <span className="text-xs">{v != null ? String(v) : "—"}</span>;
			},
		},

		{
			accessorKey: "actual_hours",
			label: "Actual hours",
			header: "Act. (h)",
			size: 80,
			headerClassName: "text-right",
			cellClassName: "text-right tabular-nums",
			cell: ({ getValue }) => {
				const v = getValue();
				return <span className="text-xs">{v != null ? String(v) : "—"}</span>;
			},
		},

		{
			id: "actions",
			label: "Actions",
			size: 40,
			enablePinning: false,
			enableReorder: false,
			isActionColumn: true,
			cell: ({ row }) => <TaskListActionCell task={row.original} />,
		},
	]);
