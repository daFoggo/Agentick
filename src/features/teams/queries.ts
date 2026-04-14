import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"
import {
  fetchTeamsFn,
  fetchMyTeamsFn,
  fetchTeamByIdFn,
  createTeamFn,
  updateTeamFn,
  deleteTeamFn,
} from "./functions"

export const teamQueries = {
  all: (params?: { name__ilike?: string; page?: number; size?: number }) =>
    queryOptions({
      queryKey: ["teams", "list", params],
      queryFn: () => fetchTeamsFn({ data: params }),
    }),
  myTeams: () =>
    queryOptions({
      queryKey: ["teams", "me"],
      queryFn: () => fetchMyTeamsFn(),
    }),
  detail: (team_id?: string) =>
    queryOptions({
      queryKey: ["teams", "detail", team_id ?? null],
      enabled: typeof team_id === "string" && team_id.length > 0,
      queryFn: () => {
        if (!team_id) {
          throw new Error("Missing team_id for team detail query")
        }
        return fetchTeamByIdFn({ data: team_id })
      },
    }),
}

export const useTeamMutations = () => {
  const queryClient = useQueryClient()

  const create = useMutation({
    mutationFn: (payload: any) => createTeamFn({ data: payload }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["teams", "list"] }),
        queryClient.invalidateQueries({ queryKey: ["teams", "me"] }),
      ])
    },
  })

  const update = useMutation({
    mutationFn: (data: { team_id: string; payload: any }) =>
      updateTeamFn({ data }),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["teams", "list"] }),
        queryClient.invalidateQueries({ queryKey: ["teams", "me"] }),
        queryClient.invalidateQueries({
          queryKey: ["teams", "detail", variables.team_id],
        }),
      ])
    },
  })

  const remove = useMutation({
    mutationFn: (team_id: string) => deleteTeamFn({ data: team_id }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["teams", "list"] }),
        queryClient.invalidateQueries({ queryKey: ["teams", "me"] }),
      ])
    },
  })

  return { create, update, remove }
}
