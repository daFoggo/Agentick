import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { MyProjectsGrid, myProjectsQueryOptions } from "@/features/projects";
import { TaskLine, TaskLineSkeleton, taskQueries } from "@/features/tasks";
import { UserGreeting, userQueries } from "@/features/users";

export const Route = createFileRoute("/dashboard/$teamId/overview/")({
	loader: async ({ context, params }) => {
		await Promise.all([
			context.queryClient.ensureQueryData(userQueries.me()),
			context.queryClient.ensureQueryData(userQueries.stats("weekly")),
			context.queryClient.ensureQueryData(taskQueries.myTasks(params.teamId)),
			context.queryClient.ensureQueryData(myProjectsQueryOptions()),
		]);
	},
	component: RouteComponent,
	staticData: {
		getTitle: () => "Overview",
	},
});

function RouteComponent() {
	return (
		<div className="flex w-full flex-col gap-4">
			<UserGreeting />
			<div className="grid grid-cols-1 gap-4 md:grid-cols-12">
				<div className="md:col-span-7">
					<Suspense fallback={<TaskLineSkeleton />}>
						<TaskLine />
					</Suspense>
				</div>
				<div className="md:col-span-5">
					<MyProjectsGrid />
				</div>
			</div>
		</div>
	);
}
