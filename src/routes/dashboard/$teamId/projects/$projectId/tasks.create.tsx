import { useSuspenseQueries } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { z } from "zod";
import { projectMembersQueryOptions } from "@/features/project-members";
import { taskConfigQueries } from "@/features/task-config";
import { TaskDetailView, tasksQueryOptions } from "@/features/tasks";

export const Route = createFileRoute(
	"/dashboard/$teamId/projects/$projectId/tasks/create",
)({
	validateSearch: z.object({
		status_id: z.string().optional(),
		parent_id: z.string().optional(),
		parent_task_id: z.string().optional(),
		redirect_to: z.string().optional(),
	}),
	loader: async ({ context, params }) => {
		const { projectId } = params;
		const commonParams = { page: 1, page_size: "all" } as const;
		const taskListParams = {
			ordering: "-id",
			page: 1,
			page_size: "all",
			is_deleted__eq: false,
		} as const;

		await Promise.all([
			context.queryClient.ensureQueryData(
				tasksQueryOptions(projectId, taskListParams),
			),
			context.queryClient.ensureQueryData(
				taskConfigQueries.statuses(projectId, commonParams),
			),
			context.queryClient.ensureQueryData(
				taskConfigQueries.types(projectId, commonParams),
			),
			context.queryClient.ensureQueryData(
				taskConfigQueries.priorities(projectId, commonParams),
			),
			context.queryClient.ensureQueryData(
				projectMembersQueryOptions(projectId),
			),
		]);
	},
	component: TaskCreatePageOrchestrator,
	staticData: {
		fixedHeight: false,
		hideViewModes: true,
	},
});

function TaskCreatePageOrchestrator() {
	const { projectId } = Route.useParams();
	const { status_id, parent_id } = Route.useSearch();
	const commonParams = { page: 1, page_size: "all" } as const;
	const taskListParams = {
		ordering: "-id",
		page: 1,
		page_size: "all",
		is_deleted__eq: false,
	} as const;

	const [tasksRes, statusesRes, typesRes, prioritiesRes, membersRes] =
		useSuspenseQueries({
			queries: [
				tasksQueryOptions(projectId, taskListParams),
				taskConfigQueries.statuses(projectId, commonParams),
				taskConfigQueries.types(projectId, commonParams),
				taskConfigQueries.priorities(projectId, commonParams),
				projectMembersQueryOptions(projectId),
			],
		});

	const parentTaskOptions = tasksRes.data?.founds ?? [];
	const statuses = statusesRes.data?.founds ?? [];
	const types = typesRes.data?.founds ?? [];
	const priorities = prioritiesRes.data?.founds ?? [];
	const members = membersRes.data?.founds ?? [];

	const taskOptions = useMemo(
		() => ({
			statuses,
			types,
			priorities,
			members,
		}),
		[statuses, types, priorities, members],
	);

	return (
		<TaskDetailView
			options={taskOptions}
			parentTaskOptions={parentTaskOptions}
			defaultStatusId={status_id}
			defaultParentId={parent_id}
		/>
	);
}
