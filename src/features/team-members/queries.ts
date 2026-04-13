import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"
import {
  fetchTeamMembersFn,
  addTeamMemberFn,
  updateTeamMemberRoleFn,
  removeTeamMemberFn,
} from "./functions"

export const teamMemberQueries = {
  list: (team_id: string) =>
    queryOptions({
      queryKey: ["teams", team_id, "members"],
      queryFn: () => fetchTeamMembersFn({ data: team_id }),
    }),
}

export const useTeamMemberMutations = () => {
  const queryClient = useQueryClient()

  const add = useMutation({
    mutationFn: (data: {
      team_id: string
      payload: { user_id: string; role: any }
    }) => addTeamMemberFn({ data }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["teams", variables.team_id, "members"],
      })
    },
  })

  const updateRole = useMutation({
    mutationFn: (data: {
      team_id: string
      user_id: string
      payload: { role: any }
    }) => updateTeamMemberRoleFn({ data }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["teams", variables.team_id, "members"],
      })
    },
  })

  const remove = useMutation({
    mutationFn: (data: { team_id: string; user_id: string }) =>
      removeTeamMemberFn({ data }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["teams", variables.team_id, "members"],
      })
    },
  })

  return { add, updateRole, remove }
}
