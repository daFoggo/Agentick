import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { projectQueryOptions } from "@/features/projects/queries";
import { taskConfigQueries } from "@/features/task-config";
import { TaskTable, taskQueries } from "@/features/tasks";
import { mapTaskData } from "@/features/tasks/helpers";

export const Route = createFileRoute(
	"/dashboard/$teamId/projects/$projectId/list",
)({
	component: ProjectListView,
});

function ProjectListView() {
	const { projectId } = Route.useParams();

	const { data: project } = useSuspenseQuery(projectQueryOptions(projectId));
	const { data: tasksResponse } = useSuspenseQuery(
		taskQueries.list(projectId, {
			ordering: "-id",
			page: 1,
			page_size: "all",
			is_deleted__eq: false,
		}),
	);

	const commonParams = { page: 1, page_size: "all" } as const;
	const { data: statusesResponse } = useSuspenseQuery(
		taskConfigQueries.statuses(projectId, commonParams),
	);
	const { data: typesResponse } = useSuspenseQuery(
		taskConfigQueries.types(projectId, commonParams),
	);
	const { data: prioritiesResponse } = useSuspenseQuery(
		taskConfigQueries.priorities(projectId, commonParams),
	);

	const sortedStatuses = useMemo(() => {
		return [...(statusesResponse?.founds ?? [])].sort(
			(a, b) => (a.order ?? 0) - (b.order ?? 0),
		);
	}, [statusesResponse]);

	const sortedTypes = useMemo(() => {
		return [...(typesResponse?.founds ?? [])].sort(
			(a, b) => (a.order ?? 0) - (b.order ?? 0),
		);
	}, [typesResponse]);

	const sortedPriorities = useMemo(() => {
		return [...(prioritiesResponse?.founds ?? [])].sort(
			(a, b) => (a.order ?? 0) - (b.order ?? 0),
		);
	}, [prioritiesResponse]);

	const taskOptions = {
		statuses: sortedStatuses,
		types: sortedTypes,
		priorities: sortedPriorities,
	};

	const tasks = (tasksResponse?.founds ?? []).map((task) =>
		mapTaskData(task, taskOptions),
	);

	return (
		<TaskTable
			projectId={projectId}
			data={tasks}
			members={project?.members ?? []}
			statuses={taskOptions.statuses}
			types={taskOptions.types}
			priorities={taskOptions.priorities}
			groupBy="status"
		/>
	);
}
