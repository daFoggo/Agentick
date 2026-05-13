import { createFileRoute, Outlet, useMatches } from "@tanstack/react-router";
import { NestedErrorFallback } from "@/components/common/error-pages";
import { ViewModeList } from "@/components/layout/app/view-mode-list";
import { PROJECT_VIEW_MODE_CATALOG } from "@/constants/view-mode-list";
import { ProjectDetailsHeader } from "@/features/projects/components/project-details-header";
import { projectQueryOptions } from "@/features/projects/queries";
import { taskConfigQueries } from "@/features/task-config";
import { tasksQueryOptions } from "@/features/tasks";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/$teamId/projects/$projectId")({
	errorComponent: NestedErrorFallback,
	loader: async ({ context, params }) => {
		const { projectId } = params;
		const commonParams = { page: 1, page_size: "all" } as const;

		// Tải thông tin project là bắt buộc
		const project = await context.queryClient.ensureQueryData(
			projectQueryOptions(projectId),
		);

		// Các thông tin khác là tùy chọn, không để chúng làm sập trang
		void context.queryClient.prefetchQuery(
			tasksQueryOptions(projectId, {
				ordering: "-id",
				page: 1,
				page_size: "all",
				is_deleted__eq: false,
			}),
		);
		void context.queryClient.prefetchQuery(
			taskConfigQueries.statuses(projectId, commonParams),
		);
		void context.queryClient.prefetchQuery(
			taskConfigQueries.types(projectId, commonParams),
		);
		void context.queryClient.prefetchQuery(
			taskConfigQueries.priorities(projectId, commonParams),
		);

		return project;
	},
	component: RouteComponent,
	staticData: {
		header: {
			render: () => <ProjectHeaderWrapper />,
		},
	},
});

const ProjectHeaderWrapper = () => {
	const { teamId } = Route.useParams();
	const project = Route.useLoaderData();
	return <ProjectDetailsHeader teamId={teamId} project={project} />;
};
function RouteComponent() {
	const { teamId, projectId } = Route.useParams();
	const matches = useMatches();
	const hideViewModeList = matches.some((m) => m.staticData.hideViewModes);
	const isFixedHeight = matches.some((m) => m.staticData.fixedHeight);

	return (
		<div
			className={cn(
				"flex flex-col gap-4 min-w-0",
				isFixedHeight && "flex-1 min-h-0 overflow-hidden",
			)}
		>
			<div className="shrink-0">
				<ViewModeList
					catalog={PROJECT_VIEW_MODE_CATALOG}
					scope="project"
					params={{ teamId, projectId }}
					hide={hideViewModeList}
				/>
			</div>
			<div
				className={cn(
					"flex flex-col flex-1 min-h-0 min-w-0",
					isFixedHeight && "overflow-hidden",
				)}
			>
				<Outlet />
			</div>
		</div>
	);
}
