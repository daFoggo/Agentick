import { createFileRoute } from "@tanstack/react-router";
import { TaskTypeList } from "@/features/task-config";

export const Route = createFileRoute(
	"/dashboard/$teamId/projects/$projectId/settings/task-types",
)({
	component: ProjectTaskTypesSettingsPage,
});

function ProjectTaskTypesSettingsPage() {
	const { projectId } = Route.useParams();

	return <TaskTypeList projectId={projectId} />;
}
