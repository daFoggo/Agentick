import { createFileRoute } from "@tanstack/react-router";
import { TeamSettings, teamQueries } from "@/features/teams";

export const Route = createFileRoute("/dashboard/$teamId/team/settings")({
	loader: async ({ context, params }) => {
		await context.queryClient.ensureQueryData(
			teamQueries.detail(params.teamId),
		);
	},
	component: TeamSettingsView,
});

function TeamSettingsView() {
	const { teamId } = Route.useParams();
	return <TeamSettings teamId={teamId} />;
}
