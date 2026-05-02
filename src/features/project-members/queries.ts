import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"
import {
  getProjectMembersFn,
  addProjectMemberFn,
  updateProjectMemberRoleFn,
  removeProjectMemberFn,
  generateProjectInviteFn,
  acceptProjectInviteFn,
} from "./functions"
import type {
  TAddProjectMemberInput,
  TUpdateProjectMemberRoleInput,
  TProjectInviteGenerateRequest,
  TProjectInviteAcceptRequest,
} from "./schemas"

export const projectMemberKeys = {
  all: ["projectMembers"] as const,
  lists: () => [...projectMemberKeys.all, "list"] as const,
  list: (projectId: string) =>
    [...projectMemberKeys.lists(), projectId] as const,
}

export const projectMembersQueryOptions = (projectId: string) =>
  queryOptions({
    queryKey: projectMemberKeys.list(projectId),
    queryFn: () => getProjectMembersFn({ data: { projectId } }),
  })

export const useProjectMemberMutations = () => {
  const queryClient = useQueryClient()

  const addMember = useMutation({
    mutationFn: (payload: TAddProjectMemberInput) =>
      addProjectMemberFn({ data: payload }),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: projectMemberKeys.list(variables.projectId),
        }),
        queryClient.invalidateQueries({
          queryKey: ["teamMembers"],
        }),
      ])
    },
  })

  const updateRole = useMutation({
    mutationFn: (payload: TUpdateProjectMemberRoleInput) =>
      updateProjectMemberRoleFn({ data: payload }),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: projectMemberKeys.list(variables.projectId),
        }),
        queryClient.invalidateQueries({
          queryKey: ["teamMembers"],
        }),
      ])
    },
  })

  const removeMember = useMutation({
    mutationFn: (data: { projectId: string; user_id: string }) =>
      removeProjectMemberFn({ data }),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: projectMemberKeys.list(variables.projectId),
        }),
        queryClient.invalidateQueries({
          queryKey: ["teamMembers"],
        }),
      ])
    },
  })

  const generateInvite = useMutation({
    mutationFn: (data: { projectId: string; payload: TProjectInviteGenerateRequest }) =>
      generateProjectInviteFn({ data }),
  })

  const acceptInvite = useMutation({
    mutationFn: (data: TProjectInviteAcceptRequest) => acceptProjectInviteFn({ data }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: projectMemberKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: ["teamMembers"],
        }),
      ])
    },
  })

  return { addMember, updateRole, removeMember, generateInvite, acceptInvite }
}
