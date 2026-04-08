import { queryOptions } from "@tanstack/react-query"
import { getProjectByIdFn, getProjectsFn } from "./functions"
import type { TGetProjectsInput } from "./schemas"

// Query key factory
export const projectKeys = {
  all: ["projects"] as const,
  lists: () => [...projectKeys.all, "list"] as const,
  list: (params: TGetProjectsInput) => [...projectKeys.lists(), params] as const,
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

export const projectQueryOptions = (projectId: string) =>
  queryOptions({
    queryKey: projectKeys.detail(projectId),
    queryFn: () => getProjectByIdFn({ data: { projectId } }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
