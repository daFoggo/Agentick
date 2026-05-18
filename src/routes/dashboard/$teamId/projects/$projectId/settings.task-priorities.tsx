import { useSuspenseQueries } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
	getProjectPermissions,
	projectQueryOptions,
} from "@/features/projects";
import { TaskPriorityList } from "@/features/task-config";
import { userMeQueryOptions } from "@/features/users";

export const Route = createFileRoute(
	"/dashboard/$teamId/projects/$projectId/settings/task-priorities",
)({
	loader: ({ context, params }) =>
		Promise.all([
			context.queryClient.ensureQueryData(
				projectQueryOptions(params.projectId),
			),
			context.queryClient.ensureQueryData(userMeQueryOptions()),
		]),
	component: ProjectTaskPrioritiesSettingsPage,
});

function ProjectTaskPrioritiesSettingsPage() {
	const { projectId } = Route.useParams();
	const [projectRes, currentUserRes] = useSuspenseQueries({
		queries: [projectQueryOptions(projectId), userMeQueryOptions()],
	});
	const permissions = getProjectPermissions(
		projectRes.data,
		currentUserRes.data?.id,
	);

	return (
		<TaskPriorityList
			projectId={projectId}
			canManageProject={permissions.canManageProject}
		/>
	);
}
