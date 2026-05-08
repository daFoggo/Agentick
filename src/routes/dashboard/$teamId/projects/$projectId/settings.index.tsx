import { createFileRoute } from "@tanstack/react-router";
import { ProjectSettings, projectQueryOptions } from "@/features/projects";

export const Route = createFileRoute(
	"/dashboard/$teamId/projects/$projectId/settings/",
)({
	loader: async ({ context, params }) => {
		await context.queryClient.ensureQueryData(
			projectQueryOptions(params.projectId),
		);
	},
	component: ProjectSettingsGeneralPage,
});

function ProjectSettingsGeneralPage() {
	const { teamId, projectId } = Route.useParams();

	return <ProjectSettings teamId={teamId} projectId={projectId} />;
}
