import { useSuspenseQueries } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { z } from "zod";

import { projectMembersQueryOptions } from "@/features/project-members";
import { taskConfigQueries } from "@/features/task-config";
import { TaskDetailView, taskQueries } from "@/features/tasks";

export const Route = createFileRoute(
	"/dashboard/$teamId/projects/$projectId/tasks/$taskId",
)({
	validateSearch: z.object({
		redirect_to: z.string().optional(),
	}),
	loader: async ({ context, params }) => {
		const { projectId, taskId } = params;
		const commonParams = { page: 1, page_size: "all" } as const;

		// Standard Loader Prefetching Pattern from Rule 1
		await Promise.all([
			context.queryClient.ensureQueryData(
				taskQueries.detail(projectId, taskId),
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
	component: TaskDetailPageOrchestrator,
	staticData: {
		fixedHeight: false,
		hideViewModes: true,
	},
});

function TaskDetailPageOrchestrator() {
	const { projectId, taskId } = Route.useParams();
	const commonParams = { page: 1, page_size: "all" } as const;

	// Using React Suspense Queries ensures safe immediate state access since data preloaded above
	const [taskRes, statusesRes, typesRes, prioritiesRes, membersRes] =
		useSuspenseQueries({
			queries: [
				taskQueries.detail(projectId, taskId),
				taskConfigQueries.statuses(projectId, commonParams),
				taskConfigQueries.types(projectId, commonParams),
				taskConfigQueries.priorities(projectId, commonParams),
				projectMembersQueryOptions(projectId),
			],
		});

	const task = taskRes.data;
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

	if (!task) return <div>Task not found</div>;

	return <TaskDetailView task={task} options={taskOptions} />;
}
