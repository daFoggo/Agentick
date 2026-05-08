import { createFileRoute } from "@tanstack/react-router";
import { TaskPriorityList } from "@/features/task-config";

export const Route = createFileRoute(
	"/dashboard/$teamId/projects/$projectId/settings/task-priorities",
)({
	component: ProjectTaskPrioritiesSettingsPage,
});

function ProjectTaskPrioritiesSettingsPage() {
	const { projectId } = Route.useParams();

	return <TaskPriorityList projectId={projectId} />;
}
