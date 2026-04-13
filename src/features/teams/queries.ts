import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  fetchTeamsFn,
  fetchTeamByIdFn,
  createTeamFn,
  updateTeamFn,
  deleteTeamFn,
} from "./functions"

/**
 * @description Query options cho tính năng Teams
 */
export const teamQueries = {
  all: (params?: { name__ilike?: string; page?: number; size?: number }) =>
    queryOptions({
      queryKey: ["teams", "list", params],
      queryFn: () => fetchTeamsFn({ data: params }),
    }),
  detail: (team_id: string) =>
    queryOptions({
      queryKey: ["teams", "detail", team_id],
      queryFn: () => fetchTeamByIdFn({ data: team_id }),
    }),
}

/**
 * @description Mutations cho tính năng Teams
 */
export const useTeamMutations = () => {
  const queryClient = useQueryClient()

  const create = useMutation({
    mutationFn: (payload: any) => createTeamFn({ data: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams", "list"] })
    },
  })

  const update = useMutation({
    mutationFn: (data: { team_id: string; payload: any }) => updateTeamFn({ data }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["teams", "list"] })
      queryClient.invalidateQueries({ queryKey: ["teams", "detail", variables.team_id] })
    },
  })

  const remove = useMutation({
    mutationFn: (team_id: string) => deleteTeamFn({ data: team_id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams", "list"] })
    },
  })

  return { create, update, remove }
}
