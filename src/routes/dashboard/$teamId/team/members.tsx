import { createFileRoute } from "@tanstack/react-router";
import {
	TeamMemberList,
	teamMembersQueryOptions,
} from "@/features/team-members";

export const Route = createFileRoute("/dashboard/$teamId/team/members")({
	loader: ({ context, params }) =>
		context.queryClient.ensureQueryData(teamMembersQueryOptions(params.teamId)),
	component: TeamMembersView,
});

function TeamMembersView() {
	const { teamId } = Route.useParams();
	return <TeamMemberList teamId={teamId} />;
}
