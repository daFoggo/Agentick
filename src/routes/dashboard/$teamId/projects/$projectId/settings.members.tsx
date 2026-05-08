import { createFileRoute } from "@tanstack/react-router";
import { ProjectMemberList } from "@/features/project-members";

export const Route = createFileRoute(
	"/dashboard/$teamId/projects/$projectId/settings/members",
)({
	component: ProjectSettingsMembersPage,
});

function ProjectSettingsMembersPage() {
	const { projectId } = Route.useParams();

	return <ProjectMemberList projectId={projectId} />;
}
