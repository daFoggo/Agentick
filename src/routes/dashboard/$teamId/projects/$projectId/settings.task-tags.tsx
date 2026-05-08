import { createFileRoute } from "@tanstack/react-router";
import { TaskTagList } from "@/features/task-config";

export const Route = createFileRoute(
	"/dashboard/$teamId/projects/$projectId/settings/task-tags",
)({
	component: ProjectTaskTagsSettingsPage,
});

function ProjectTaskTagsSettingsPage() {
	const { projectId } = Route.useParams();

	return <TaskTagList projectId={projectId} />;
}
