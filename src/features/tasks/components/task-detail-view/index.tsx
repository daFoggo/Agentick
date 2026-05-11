import { useForm } from "@tanstack/react-form";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
	buildTaskDetailPayload,
	cloneTaskDetailFormValues,
	getTaskDetailDefaultValues,
	type ITaskListDialogOptions,
	serializeTaskDetailFormValues,
} from "@/features/tasks/helpers";
import { useTaskMutations } from "@/features/tasks/queries";
import {
	CreateTaskSchema,
	type TTask,
	type TTaskAIEstimationExplanation,
	type TTaskDetailFormValues,
	UpdateTaskSchema,
} from "@/features/tasks/schemas";
import { DeleteTaskListDialog } from "../task-table/delete-task-list-dialog";
import { TaskDetailHeader } from "./task-detail-header";
import { TaskDetailMainSection } from "./task-detail-main-section";
import { TaskDetailSidebarSection } from "./task-detail-sidebar-section";

interface ITaskDetailViewProps {
	task?: TTask;
	options: ITaskListDialogOptions;
	isLoading?: boolean;
	defaultStatusId?: string;
}

export const TaskDetailView = ({
	task,
	options,
	isLoading,
	defaultStatusId,
}: ITaskDetailViewProps) => {
	const navigate = useNavigate();
	const { teamId, projectId } = useParams({ strict: false });
	const { update, remove, estimate, create } = useTaskMutations();
	const [aiExplanation, setAiExplanation] =
		useState<TTaskAIEstimationExplanation | null>(null);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

	const defaultValues = getTaskDetailDefaultValues(
		task,
		options,
		defaultStatusId,
	);
	const lastSavedSignatureRef = useRef(
		serializeTaskDetailFormValues(defaultValues),
	);
	const autosaveQueueRef = useRef<TTaskDetailFormValues | null>(null);
	const autosaveRunningRef = useRef(false);
	type TAutosaveFormApi = { reset: (value: TTaskDetailFormValues) => void };

	const queueAutosave = async (
		formApi: TAutosaveFormApi,
		value: TTaskDetailFormValues,
	) => {
		if (!task?.id) return;

		autosaveQueueRef.current = cloneTaskDetailFormValues(value);
		if (autosaveRunningRef.current) return;

		autosaveRunningRef.current = true;

		try {
			while (autosaveQueueRef.current) {
				const nextValue = autosaveQueueRef.current;
				autosaveQueueRef.current = null;

				const signature = serializeTaskDetailFormValues(nextValue);
				if (signature === lastSavedSignatureRef.current) {
					continue;
				}

				const taskPayload = buildTaskDetailPayload(nextValue);
				if (!taskPayload) {
					toast.error("Invalid dates provided");
					return;
				}

				const targetProjectId = projectId || task.project_id;
				if (!targetProjectId) {
					toast.error("Project boundary context missing");
					return;
				}

				await update.mutateAsync({
					projectId: targetProjectId,
					taskId: task.id,
					payload: taskPayload.payload,
				});

				lastSavedSignatureRef.current = signature;

				if (!autosaveQueueRef.current) {
					formApi.reset(cloneTaskDetailFormValues(nextValue));
				}
			}
		} catch (_error) {
			toast.error("Failed to update task");
		} finally {
			autosaveRunningRef.current = false;
		}
	};

	const form = useForm({
		defaultValues,
		validators: {
			// Dynamically choose schema if we wanted full validation, but usually Update is looser/safer
			onSubmit: (task ? UpdateTaskSchema : CreateTaskSchema) as any,
		},
		listeners: {
			onChangeDebounceMs: 1000,
			onChange: ({ formApi }) => {
				if (task?.id && formApi.state.isDirty) {
					void queueAutosave(
						formApi,
						formApi.state.values as TTaskDetailFormValues,
					);
				}
			},
			onBlur: ({ formApi }) => {
				if (task?.id && formApi.state.isDirty) {
					void queueAutosave(
						formApi,
						formApi.state.values as TTaskDetailFormValues,
					);
				}
			},
		},
		onSubmit: async ({ value }) => {
			const taskPayload = buildTaskDetailPayload(
				value as TTaskDetailFormValues,
			);
			if (!taskPayload) {
				toast.error("Invalid dates provided");
				return;
			}

			const targetProjectId = projectId || task?.project_id;
			if (!targetProjectId) {
				toast.error("Project boundary context missing");
				return;
			}

			try {
				if (task?.id) {
					// Mode: UPDATE
					await update.mutateAsync({
						projectId: targetProjectId,
						taskId: task.id,
						payload: taskPayload.payload,
					});
					toast.success("Task updated successfully");
				} else {
					// Mode: CREATE
					const createPayload = {
						...taskPayload.payload,
						project_id: targetProjectId,
						order: 0,
					};
					await create.mutateAsync({
						projectId: targetProjectId,
						payload: createPayload,
					});
					toast.success("Task created successfully!");
				}

				if (task?.id) {
					lastSavedSignatureRef.current = serializeTaskDetailFormValues(
						value as TTaskDetailFormValues,
					);
					form.reset(cloneTaskDetailFormValues(value as TTaskDetailFormValues));
				}

				// Only eject back to project context if performing absolute creation routines.
				if (!task?.id) {
					navigate({
						to: "/dashboard/$teamId/projects/$projectId/list",
						params: {
							teamId: teamId || "personal",
							projectId: targetProjectId,
						},
					});
				}
			} catch (_error) {
				toast.error(task ? "Failed to update task" : "Failed to create task");
			}
		},
	});

	const handleAIEstimate = async () => {
		const title = form.getFieldValue("title");
		if (!title) {
			toast.error("Please enter a task title first!");
			return;
		}
		const targetProjectId = projectId || task?.project_id;
		if (!targetProjectId) {
			toast.error("No active project context found for AI prediction");
			return;
		}

		try {
			const result = await estimate.mutateAsync({
				projectId: targetProjectId,
				payload: {
					title,
					description: form.getFieldValue("description") || null,
				},
			});
			if (result?.suggested_hours !== undefined) {
				form.setFieldValue("estimated_hours", result.suggested_hours);
				setAiExplanation(result);
			}
		} catch (_err) {
			toast.error("Failed to generate AI estimation");
		}
	};

	const handleConfirmDelete = async () => {
		if (!task?.id) return false;
		try {
			await remove.mutateAsync({
				projectId: projectId || task.project_id,
				taskId: task.id,
			});
			toast.success("Task deleted successfully");
			navigate({
				to: "/dashboard/$teamId/projects/$projectId/list",
				params: {
					teamId: teamId || "personal",
					projectId: projectId || task.project_id,
				},
			});
			return true;
		} catch {
			toast.error("Failed to delete task");
			return false;
		}
	};

	if (isLoading) {
		return (
			<div className="container grid max-w-7xl grid-cols-1 gap-4 p-6 lg:grid-cols-[1fr_380px]">
				<div className="space-y-4">
					<Skeleton className="h-10 w-1/3" />
					<Skeleton className="h-50 w-full" />
				</div>
				<div className="space-y-4">
					<Skeleton className="h-100 w-full" />
				</div>
			</div>
		);
	}

	return (
		<>
			<form
				data-slot="task-detail-view"
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
				className="container h-full"
			>
				<Card size="sm">
					<TaskDetailHeader
						task={task}
						form={form}
						canSubmit={form.state.canSubmit}
						isPending={
							update.isPending || create.isPending || form.state.isSubmitting
						}
						onBack={() =>
							navigate({
								to: "/dashboard/$teamId/projects/$projectId/list",
								params: {
									teamId: teamId || "personal",
									projectId: projectId || task?.project_id || "",
								},
							})
						}
						onOpenDeleteDialog={() => setIsDeleteDialogOpen(true)}
					/>
					<CardContent>
						<div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
							<TaskDetailMainSection form={form} taskId={task?.id} />
							<TaskDetailSidebarSection
								form={form}
								options={options}
								aiExplanation={aiExplanation}
								isEstimating={estimate.isPending}
								onAIEstimate={handleAIEstimate}
							/>
						</div>
					</CardContent>
				</Card>
			</form>
			{task && (
				<DeleteTaskListDialog
					task={task}
					open={isDeleteDialogOpen}
					onOpenChange={setIsDeleteDialogOpen}
					isPending={remove.isPending}
					onConfirm={handleConfirmDelete}
				/>
			)}
		</>
	);
};
