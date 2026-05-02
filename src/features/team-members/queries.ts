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
  generateTeamInviteFn,
  acceptTeamInviteFn,
} from "./functions"
import type { TAddTeamMemberInput, TUpdateTeamMemberRoleInput, TTeamInviteGenerateRequest, TTeamInviteAcceptRequest } from "./schemas"

export const teamMemberKeys = {
  all: ["teamMembers"] as const,
  lists: () => [...teamMemberKeys.all, "list"] as const,
  list: (teamId: string) => [...teamMemberKeys.lists(), teamId] as const,
}

export const teamMembersQueryOptions = (teamId: string) =>
  queryOptions({
    queryKey: teamMemberKeys.list(teamId),
    queryFn: () => fetchTeamMembersFn({ data: { teamId } }),
  })

export const memberProjectCountQueryOptions = (teamId: string, userId: string) =>
  queryOptions({
    queryKey: [...teamMemberKeys.list(teamId), userId, "projectCount"],
    queryFn: () => getMemberProjectCountFn({ data: { teamId, user_id: userId } }),
    staleTime: 1000 * 30,
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

  const generateInvite = useMutation({
    mutationFn: (data: { teamId: string; payload: TTeamInviteGenerateRequest }) =>
      generateTeamInviteFn({ data }),
  })

  const acceptInvite = useMutation({
    mutationFn: (data: TTeamInviteAcceptRequest) => acceptTeamInviteFn({ data }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: teamMemberKeys.all,
      })
    },
  })

  return { addMember, updateRole, removeMember, generateInvite, acceptInvite }
}
