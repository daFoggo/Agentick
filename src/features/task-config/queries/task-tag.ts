import {
	queryOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import {
	createTaskTagFn,
	deleteTaskTagFn,
	getTaskTagByIdFn,
	getTaskTagsFn,
	updateTaskTagFn,
} from "../functions";
import type { TTaskTagFindInput } from "../schemas";
import { taskConfigKeys } from "./keys";

export const taskTagQueries = {
	tags: (projectId: string, params?: TTaskTagFindInput) =>
		queryOptions({
			queryKey: taskConfigKeys.tags(projectId, params),
			queryFn: () => getTaskTagsFn({ data: { projectId, params } }),
		}),
	tagDetail: (projectId: string, tagId: string) =>
		queryOptions({
			queryKey: taskConfigKeys.tagDetail(projectId, tagId),
			queryFn: () => getTaskTagByIdFn({ data: { projectId, tagId } }),
		}),
};

export const useTaskTagMutations = () => {
	const queryClient = useQueryClient();

	const createTag = useMutation({
		mutationFn: (data: { projectId: string; payload: any }) =>
			createTaskTagFn({ data }),
		onSuccess: async (_, variables) => {
			await queryClient.invalidateQueries({
				queryKey: taskConfigKeys.all(variables.projectId),
			});
		},
	});

	const updateTag = useMutation({
		mutationFn: (data: { projectId: string; tagId: string; payload: any }) =>
			updateTaskTagFn({ data }),
		onSuccess: async (_, variables) => {
			await queryClient.invalidateQueries({
				queryKey: taskConfigKeys.all(variables.projectId),
			});
		},
	});

	const removeTag = useMutation({
		mutationFn: (data: { projectId: string; tagId: string }) =>
			deleteTaskTagFn({ data }),
		onSuccess: async (_, variables) => {
			await queryClient.invalidateQueries({
				queryKey: taskConfigKeys.all(variables.projectId),
			});
		},
	});

	return {
		createTag,
		updateTag,
		removeTag,
	};
};
