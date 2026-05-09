import {
	queryOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import {
	createTaskFn,
	deleteTaskFn,
	estimateTaskFn,
	fetchMyTasksFn,
	fetchTaskByIdFn,
	fetchTasksFn,
	updateTaskFn,
} from "./functions";
import type { TFindTasksInput } from "./schemas";

/**
 * Các Query Keys dùng cho việc quản lý Cache của React Query
 */
export const taskKeys = {
	all: ["tasks"] as const,
	lists: () => [...taskKeys.all, "list"] as const,
	list: (projectId?: string, params?: TFindTasksInput) =>
		[...taskKeys.lists(), projectId, params] as const,
	details: () => [...taskKeys.all, "detail"] as const,
	detail: (projectId: string, taskId: string) =>
		[...taskKeys.details(), projectId, taskId] as const,
	myTasks: (teamId?: string) =>
		[...taskKeys.all, "my-tasks", teamId ?? "all"] as const,
};

/**
 * Các Query Object dùng cho việc Fetch data (React Query)
 */
export const taskQueries = {
	list: (projectId?: string, params?: TFindTasksInput) =>
		queryOptions({
			queryKey: taskKeys.list(projectId, params),
			queryFn: () => fetchTasksFn({ data: { projectId, params } }),
		}),
	detail: (projectId: string, taskId: string) =>
		queryOptions({
			queryKey: taskKeys.detail(projectId, taskId),
			queryFn: () => fetchTaskByIdFn({ data: { projectId, taskId } }),
		}),
	myTasks: (teamId?: string) =>
		queryOptions({
			queryKey: taskKeys.myTasks(teamId),
			queryFn: () =>
				fetchMyTasksFn({
					data: {
						params: {
							page_size: "all",
							team_id__eq: teamId,
						},
					},
				}),
		}),
};

/**
 * Invalidate tất cả query liên quan đến dashboard charts của project.
 * Dùng prefix ["projects"] để bắt cả task-stats lẫn workload mà không cần projectId cụ thể.
 */
const invalidateDashboardCharts = (
	queryClient: ReturnType<typeof useQueryClient>,
) =>
	Promise.all([
		queryClient.invalidateQueries({ queryKey: ["projects", "task-stats"] }),
		queryClient.invalidateQueries({ queryKey: ["projects", "workload"] }),
		queryClient.invalidateQueries({ queryKey: ["projects", "recent-updates"] }),
	]);

/**
 * Hook quản lý các Mutation liên quan đến Task (Create, Update, Delete)
 */
export const useTaskMutations = () => {
	const queryClient = useQueryClient();

	const create = useMutation({
		mutationFn: (data: { projectId: string; payload: any }) =>
			createTaskFn({ data }),
		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: taskKeys.lists() }),
				queryClient.invalidateQueries({ queryKey: taskKeys.details() }),
				queryClient.invalidateQueries({ queryKey: taskKeys.myTasks() }),
				queryClient.invalidateQueries({ queryKey: ["users", "stats"] }),
				invalidateDashboardCharts(queryClient),
			]);
		},
	});

	const update = useMutation({
		mutationFn: (data: { projectId: string; taskId: string; payload: any }) =>
			updateTaskFn({ data }),
		onSuccess: async (_, variables) => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: taskKeys.lists() }),
				queryClient.invalidateQueries({
					queryKey: taskKeys.detail(variables.projectId, variables.taskId),
				}),
				queryClient.invalidateQueries({ queryKey: taskKeys.myTasks() }),
				queryClient.invalidateQueries({ queryKey: ["users", "stats"] }),
				invalidateDashboardCharts(queryClient),
			]);
		},
	});

	const remove = useMutation({
		mutationFn: (data: { projectId: string; taskId: string }) =>
			deleteTaskFn({ data }),
		onSuccess: async (_, variables) => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: taskKeys.lists() }),
				queryClient.invalidateQueries({
					queryKey: taskKeys.detail(variables.projectId, variables.taskId),
				}),
				queryClient.invalidateQueries({ queryKey: taskKeys.myTasks() }),
				queryClient.invalidateQueries({ queryKey: ["users", "stats"] }),
				invalidateDashboardCharts(queryClient),
			]);
		},
	});

	const estimate = useMutation({
		mutationFn: (data: {
			projectId: string;
			payload: { title: string; description: string | null };
		}) => estimateTaskFn({ data }),
	});

	return { create, update, remove, estimate };
};
