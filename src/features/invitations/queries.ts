import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getMyInvitationsFn,
  acceptInvitationFn,
  declineInvitationFn,
  getInvitationByIdFn,
} from "./functions"
import { toast } from "sonner"
import { useRouter } from "@tanstack/react-router"

export const invitationQueries = {
  all: () => ["invitations"],
  my: () =>
    queryOptions({
      queryKey: [...invitationQueries.all(), "my"],
      queryFn: () => getMyInvitationsFn(),
    }),
  getById: (invitationId: string) =>
    queryOptions({
      queryKey: [...invitationQueries.all(), "getById", invitationId],
      queryFn: () => getInvitationByIdFn({ data: { invitationId } }),
    }),
}

export function useInvitationMutations() {
  const queryClient = useQueryClient()
  const router = useRouter()

  const accept = useMutation({
    mutationFn: (invitationId: string) => acceptInvitationFn({ data: { invitationId } }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: invitationQueries.my().queryKey })
      // Invalidate projects/teams so the new ones show up
      queryClient.invalidateQueries({ queryKey: ["teams"] })
      queryClient.invalidateQueries({ queryKey: ["projects"] })
      toast.success("Invitation accepted successfully")
      
      // Navigate to the specific team or project
      if (data.team_id && !data.project_id) {
        // Team invitation
        router.navigate({ 
          to: "/dashboard/$teamId/team/members", 
          params: { teamId: data.team_id } 
        })
      } else if (data.project_id && data.project?.team_id) {
        // Project invitation
        router.navigate({ 
          to: "/dashboard/$teamId/projects/$projectId/list", 
          params: { 
            teamId: data.project.team_id,
            projectId: data.project_id 
          } 
        })
      } else if (data.project_id && data.team_id) {
         // Project invitation with team_id provided
         router.navigate({ 
          to: "/dashboard/$teamId/projects/$projectId/list", 
          params: { 
            teamId: data.team_id,
            projectId: data.project_id 
          } 
        })
      } else {
        router.navigate({ to: "/dashboard" })
      }
    },
    onError: (error) => {
      toast.error("Failed to accept invitation")
      console.error(error)
    },
  })

  const decline = useMutation({
    mutationFn: (invitationId: string) => declineInvitationFn({ data: { invitationId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invitationQueries.my().queryKey })
      toast.success("Invitation declined")
    },
    onError: (error) => {
      toast.error("Failed to decline invitation")
      console.error(error)
    },
  })

  return { accept, decline }
}
