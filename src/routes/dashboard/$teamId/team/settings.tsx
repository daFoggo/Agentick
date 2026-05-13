import { createFileRoute } from "@tanstack/react-router";
import { TeamSettings, teamQueryOptions } from "@/features/teams";

export const Route = createFileRoute("/dashboard/$teamId/team/settings")({
	loader: async ({ context, params }) => {
		await context.queryClient.ensureQueryData(teamQueryOptions(params.teamId));
	},
	component: TeamSettingsView,
});

function TeamSettingsView() {
	const { teamId } = Route.useParams();
	return <TeamSettings teamId={teamId} />;
}
