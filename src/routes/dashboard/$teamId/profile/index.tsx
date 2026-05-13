import { createFileRoute } from "@tanstack/react-router";
import { MyProjectsList, myProjectsQueryOptions } from "@/features/projects";
import { MyTeamsList, myTeamsQueryOptions } from "@/features/teams";
import { ProfileCard, userMeQueryOptions } from "@/features/users";

export const Route = createFileRoute("/dashboard/$teamId/profile/")({
	loader: async ({ context, params }) => {
		void context.queryClient.prefetchQuery(
			myProjectsQueryOptions(params.teamId),
		);
		void context.queryClient.prefetchQuery(myTeamsQueryOptions());

		await context.queryClient.ensureQueryData(userMeQueryOptions());
	},
	component: ProfileDashboardComponent,
	staticData: {
		getTitle: () => "My Profile",
	},
});

function ProfileDashboardComponent() {
	return (
		<div className="flex w-full flex-col gap-6">
			<div className="grid grid-cols-1 items-start gap-6 md:grid-cols-12">
				<div className="flex flex-col gap-6 md:col-span-4 lg:col-span-3">
					<ProfileCard />
					<MyTeamsList />
				</div>

				<div className="flex flex-col gap-6 md:col-span-8 lg:col-span-9">
					<MyProjectsList />
				</div>
			</div>
		</div>
	);
}
