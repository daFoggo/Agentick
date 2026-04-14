import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query"
import { getProjectByIdFn, getProjectsFn, getMyProjectsFn, createProjectFn, updateProjectFn, deleteProjectFn } from "./functions"
import type { TGetProjectsInput } from "./schemas"

// Query key factory
export const projectKeys = {
  all: ["projects"] as const,
  lists: () => [...projectKeys.all, "list"] as const,
  list: (params: TGetProjectsInput) => [...projectKeys.lists(), params] as const,
  myProjects: () => ["projects", "me"] as const,
  details: () => [...projectKeys.all, "detail"] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
}

// Query options
export const projectsQueryOptions = (params: TGetProjectsInput = {}) =>
  queryOptions({
    queryKey: projectKeys.list(params),
    queryFn: () => getProjectsFn({ data: params }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

export const myProjectsQueryOptions = () =>
  queryOptions({
    queryKey: projectKeys.myProjects(),
    queryFn: () => getMyProjectsFn(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

export const projectQueryOptions = (projectId: string) =>
  queryOptions({
    queryKey: projectKeys.detail(projectId),
    queryFn: () => getProjectByIdFn({ data: { projectId } }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

export const useProjectMutations = () => {
  const queryClient = useQueryClient()

  const create = useMutation({
    mutationFn: (payload: any) => createProjectFn({ data: payload }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: projectKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: projectKeys.myProjects() }),
      ])
    },
  })

  const update = useMutation({
    mutationFn: (data: { projectId: string; payload: any }) =>
      updateProjectFn({ data: { projectId: data.projectId, payload: data.payload } }),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: projectKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: projectKeys.myProjects() }),
        queryClient.invalidateQueries({
          queryKey: projectKeys.detail(variables.projectId),
        }),
      ])
    },
  })

  const remove = useMutation({
    mutationFn: (projectId: string) => deleteProjectFn({ data: projectId }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: projectKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: projectKeys.myProjects() }),
      ])
    },
  })

  return { create, update, remove }
}

