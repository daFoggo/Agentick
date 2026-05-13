import { createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";
import { Suspense } from "react";
import { MyProjectsGrid, myProjectsQueryOptions } from "@/features/projects";
import {
	myTasksOverviewQueryOptions,
	TaskLine,
	TaskLineSkeleton,
} from "@/features/tasks";
import {
	UserGreeting,
	userGreetingQueryOptions,
	userMeQueryOptions,
	userStatsQueryOptions,
} from "@/features/users";

export const Route = createFileRoute("/dashboard/$teamId/overview/")({
	loader: async ({ context, params }) => {
		const today = format(new Date(), "yyyy-MM-dd");

		// Tải trước các thông tin không bắt buộc
		void context.queryClient.prefetchQuery(userStatsQueryOptions("weekly"));

		// Đảm bảo các thông tin bắt buộc cho component dùng Suspense được tải xong
		await Promise.all([
			context.queryClient.ensureQueryData(userMeQueryOptions()),
			context.queryClient.ensureQueryData(userGreetingQueryOptions()),
			context.queryClient.ensureQueryData(
				myTasksOverviewQueryOptions(params.teamId, today),
			),
			context.queryClient.ensureQueryData(
				myProjectsQueryOptions(params.teamId),
			),
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
