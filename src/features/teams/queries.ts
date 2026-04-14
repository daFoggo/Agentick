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
  detail: (teamId?: string) =>
    queryOptions({
      queryKey: ["teams", "detail", teamId ?? null],
      enabled: typeof teamId === "string" && teamId.length > 0,
      queryFn: () => {
        if (!teamId) {
          throw new Error("Missing teamId for team detail query")
        }
        return fetchTeamByIdFn({ data: teamId })
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
    mutationFn: (data: { teamId: string; payload: any }) =>
      updateTeamFn({ data }),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["teams", "list"] }),
        queryClient.invalidateQueries({ queryKey: ["teams", "me"] }),
        queryClient.invalidateQueries({
          queryKey: ["teams", "detail", variables.teamId],
        }),
      ])
    },
  })

  const remove = useMutation({
    mutationFn: (teamId: string) => deleteTeamFn({ data: teamId }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["teams", "list"] }),
        queryClient.invalidateQueries({ queryKey: ["teams", "me"] }),
      ])
    },
  })

  return { create, update, remove }
}
