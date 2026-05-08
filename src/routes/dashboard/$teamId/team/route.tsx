import { createFileRoute, Outlet } from "@tanstack/react-router";
import { ViewModeList } from "@/components/layout/app/view-mode-list";
import { TEAM_VIEW_MODE_CATALOG } from "@/constants/view-mode-list";
import { TeamDetailsHeader, teamQueries } from "@/features/teams";

export const Route = createFileRoute("/dashboard/$teamId/team")({
	loader: ({ context, params }) =>
		context.queryClient.ensureQueryData(teamQueries.detail(params.teamId)),
	component: RouteComponent,
	staticData: {
		getTitle: () => "Team Details",
		header: {
			render: () => <HeaderWrapper />,
		},
	},
});

function HeaderWrapper() {
	const team = Route.useLoaderData();
	return <TeamDetailsHeader team={team} />;
}

function RouteComponent() {
	const { teamId } = Route.useParams();

	return (
		<div className="flex flex-col gap-4">
			<ViewModeList
				catalog={TEAM_VIEW_MODE_CATALOG}
				scope="team"
				params={{ teamId }}
				allowCustomization={false}
			/>
			<Outlet />
		</div>
	);
}
