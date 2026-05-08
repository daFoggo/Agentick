import { createFileRoute, redirect } from "@tanstack/react-router";
import { teamQueries } from "@/features/teams";
import { userQueries } from "@/features/users";
import { useDashboardStore } from "@/stores/use-dashboard-store";

export const Route = createFileRoute("/dashboard/")({
	beforeLoad: async ({ context }) => {
		await context.queryClient.ensureQueryData(userQueries.me());

		const teams = await context.queryClient.ensureQueryData(
			teamQueries.myTeams(),
		);
		const lastTeamId = useDashboardStore.getState().last_team_id;
		const hasLastTeam = teams?.some((t) => t.id === lastTeamId);
		const defaultTeamId = hasLastTeam
			? lastTeamId
			: teams && teams.length > 0
				? teams[0].id
				: "personal";

		throw redirect({
			to: "/dashboard/$teamId/overview",
			params: {
				teamId: defaultTeamId as string,
			},
			replace: true,
		});
	},
});
