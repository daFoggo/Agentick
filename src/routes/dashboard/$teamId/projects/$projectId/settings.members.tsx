import { createFileRoute } from "@tanstack/react-router";
import {
	ProjectMemberList,
	projectMembersQueryOptions,
} from "@/features/project-members";

export const Route = createFileRoute(
	"/dashboard/$teamId/projects/$projectId/settings/members",
)({
	loader: ({ context, params }) =>
		context.queryClient.ensureQueryData(
			projectMembersQueryOptions(params.projectId),
		),
	component: ProjectSettingsMembersPage,
});

function ProjectSettingsMembersPage() {
	const { projectId } = Route.useParams();

	return <ProjectMemberList projectId={projectId} />;
}
