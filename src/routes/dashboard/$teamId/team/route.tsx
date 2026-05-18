import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { NestedErrorFallback } from "@/components/common/error-pages";
import { ViewModeList } from "@/components/layout/app/view-mode-list";
import { TEAM_VIEW_MODE_CATALOG } from "@/constants/view-mode-list";
import { teamMembersQueryOptions } from "@/features/team-members";
import {
	getTeamPermissions,
	TeamDetailsHeader,
	teamQueryOptions,
} from "@/features/teams";
import { userMeQueryOptions } from "@/features/users";

export const Route = createFileRoute("/dashboard/$teamId/team")({
	errorComponent: NestedErrorFallback,
	loader: async ({ context, params }) => {
		const team = await context.queryClient.ensureQueryData(
			teamQueryOptions(params.teamId),
		);
		await Promise.all([
			context.queryClient.ensureQueryData(
				teamMembersQueryOptions(params.teamId),
			),
			context.queryClient.ensureQueryData(userMeQueryOptions()),
		]);
		return team;
	},
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
	const { data: currentUser } = useSuspenseQuery(userMeQueryOptions());
	const { data: membersData } = useSuspenseQuery(
		teamMembersQueryOptions(teamId),
	);
	const permissions = getTeamPermissions(
		membersData?.founds ?? [],
		currentUser?.id,
	);
	const catalog = permissions.canManageTeam
		? TEAM_VIEW_MODE_CATALOG
		: TEAM_VIEW_MODE_CATALOG.filter((mode) => mode.value !== "settings");

	return (
		<div className="flex flex-col gap-4">
			<ViewModeList
				catalog={catalog}
				scope="team"
				params={{ teamId }}
				allowCustomization={false}
			/>
			<Outlet />
		</div>
	);
}
