import {
	queryOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import {
	createPhaseFn,
	deletePhaseFn,
	getPhaseByIdFn,
	getPhasesFn,
	updatePhaseFn,
} from "./functions";
import type { TPhaseFindInput } from "./schemas";

export const phaseKeys = {
	all: (projectId: string) => ["phases", projectId] as const,
	list: (projectId: string, params?: TPhaseFindInput) =>
		[...phaseKeys.all(projectId), "list", params] as const,
	detail: (projectId: string, phaseId: string) =>
		[...phaseKeys.all(projectId), "detail", phaseId] as const,
};

export const phaseQueries = {
	list: (projectId: string, params?: TPhaseFindInput) =>
		queryOptions({
			queryKey: phaseKeys.list(projectId, params),
			queryFn: () => getPhasesFn({ data: { projectId, params } }),
		}),
	detail: (projectId: string, phaseId: string) =>
		queryOptions({
			queryKey: phaseKeys.detail(projectId, phaseId),
			queryFn: () => getPhaseByIdFn({ data: { projectId, phaseId } }),
		}),
};

export const usePhaseMutations = () => {
	const queryClient = useQueryClient();

	const create = useMutation({
		mutationFn: (data: { projectId: string; payload: any }) =>
			createPhaseFn({ data }),
		onSuccess: async (_, variables) => {
			await queryClient.invalidateQueries({
				queryKey: phaseKeys.all(variables.projectId),
			});
		},
	});

	const update = useMutation({
		mutationFn: (data: { projectId: string; phaseId: string; payload: any }) =>
			updatePhaseFn({ data }),
		onSuccess: async (_, variables) => {
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: phaseKeys.all(variables.projectId),
				}),
				queryClient.invalidateQueries({
					queryKey: phaseKeys.detail(variables.projectId, variables.phaseId),
				}),
			]);
		},
	});

	const remove = useMutation({
		mutationFn: (data: { projectId: string; phaseId: string }) =>
			deletePhaseFn({ data }),
		onSuccess: async (_, variables) => {
			await queryClient.invalidateQueries({
				queryKey: phaseKeys.all(variables.projectId),
			});
		},
	});

	return { create, update, remove };
};
