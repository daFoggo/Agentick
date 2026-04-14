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
  getMemberProjectCountFn,
} from "./functions"
import type { TAddTeamMemberInput, TUpdateTeamMemberRoleInput } from "./schemas"

export const teamMemberKeys = {
  all: ["teamMembers"] as const,
  lists: () => [...teamMemberKeys.all, "list"] as const,
  list: (teamId: string) => [...teamMemberKeys.lists(), teamId] as const,
}

// Query options
export const teamMembersQueryOptions = (teamId: string) =>
  queryOptions({
    queryKey: teamMemberKeys.list(teamId),
    queryFn: () => fetchTeamMembersFn({ data: { teamId } }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

export const memberProjectCountQueryOptions = (teamId: string, userId: string) =>
  queryOptions({
    queryKey: [...teamMemberKeys.list(teamId), userId, "projectCount"],
    queryFn: () => getMemberProjectCountFn({ data: { teamId, user_id: userId } }),
    staleTime: 1000 * 30, // 30 seconds
  })

export const useTeamMemberMutations = () => {
  const queryClient = useQueryClient()

  const addMember = useMutation({
    mutationFn: (payload: TAddTeamMemberInput) => addTeamMemberFn({ data: payload }),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: teamMemberKeys.list(variables.teamId),
      })
    },
  })

  const updateRole = useMutation({
    mutationFn: (payload: TUpdateTeamMemberRoleInput) =>
      updateTeamMemberRoleFn({ data: payload }),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: teamMemberKeys.list(variables.teamId),
      })
    },
  })

  const removeMember = useMutation({
    mutationFn: (data: { teamId: string; user_id: string }) =>
      removeTeamMemberFn({ data }),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: teamMemberKeys.list(variables.teamId),
      })
    },
  })

  return { addMember, updateRole, removeMember }
}
