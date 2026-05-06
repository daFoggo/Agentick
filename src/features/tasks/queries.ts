import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"
import {
  createTaskFn,
  deleteTaskFn,
  fetchMyTasksFn,
  fetchTaskByIdFn,
  fetchTasksFn,
  updateTaskFn,
} from "./functions"
import type { TFindTasksInput } from "./schemas"

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
  myTasks: () => [...taskKeys.all, "my-tasks"] as const,
}

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
  myTasks: () =>
    queryOptions({
      queryKey: taskKeys.myTasks(),
      queryFn: () =>
        fetchMyTasksFn({ data: { params: { page_size: "all" } } }),
    }),
}

/**
 * Hook quản lý các Mutation liên quan đến Task (Create, Update, Delete)
 */
export const useTaskMutations = () => {
  const queryClient = useQueryClient()

  const create = useMutation({
    mutationFn: (data: { projectId: string; payload: any }) =>
      createTaskFn({ data }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: taskKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: taskKeys.details() }),
        queryClient.invalidateQueries({ queryKey: taskKeys.myTasks() }),
        queryClient.invalidateQueries({ queryKey: ["users", "stats"] }),
      ])
    },
  })

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
      ])
    },
  })

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
      ])
    },
  })

  return { create, update, remove }
}
