import { createFileRoute } from "@tanstack/react-router";
import {
	ProjectAISummary,
	ProjectStatusUpdate,
	ProjectTaskStatsCard,
	ProjectWorkload,
	projectRecentStatusUpdatesQueryOptions,
	projectTaskStatsQueryOptions,
	projectWorkloadQueryOptions,
} from "@/features/projects";

export const Route = createFileRoute(
	"/dashboard/$teamId/projects/$projectId/dashboard",
)({
	loader: async ({ params, context }) => {
		const { projectId } = params;
		await Promise.all([
			context.queryClient.ensureQueryData(
				projectTaskStatsQueryOptions(projectId, "weekly"),
			),
			context.queryClient.ensureQueryData(
				projectWorkloadQueryOptions(projectId, "weekly"),
			),
			context.queryClient.ensureQueryData(
				projectRecentStatusUpdatesQueryOptions(projectId, 15),
			),
		]);
	},
	component: ProjectDashboardView,
});

function ProjectDashboardView() {
	const { projectId } = Route.useParams();

	return (
		<div className="grid grid-cols-1 gap-4 lg:grid-cols-5 auto-rows-max">
			<div className="grid gap-4 lg:col-span-3">
				<ProjectTaskStatsCard />
				<ProjectWorkload />
			</div>
			<div className="flex flex-col gap-4 lg:col-span-2">
				<ProjectAISummary projectId={projectId} />
				<ProjectStatusUpdate projectId={projectId} />
			</div>
		</div>
	);
}
