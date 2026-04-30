import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { z } from "zod"
import { useState } from "react"
import { Loader2, CheckCircle2, XCircle, AlertCircle, LogOut } from "lucide-react"
import { toast } from "sonner"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export const Route = createFileRoute("/invite/accept")({
  validateSearch: z.object({
    id: z.string(),
  }),
  component: AcceptInvitePage,
})

import { invitationQueries, acceptInvitationFn, declineInvitationFn } from "@/features/invitations"
import { userQueries } from "@/features/users"
import { getAuthToken, deleteAuthToken } from "@/lib/auth-token"

function AcceptInvitePage() {
  const { id } = Route.useSearch()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  
  const { data: invitation, isLoading: isFetchingInvitation } = useQuery(invitationQueries.getById(id))
  const { data: currentUser, isLoading: isFetchingUser } = useQuery({
    ...userQueries.me(),
    retry: false,
  })

  const isLoading = isFetchingInvitation || isFetchingUser

  const isEmailMismatch = 
    currentUser && 
    invitation && 
    currentUser.email.trim().toLowerCase() !== invitation.email.trim().toLowerCase()

  const acceptMutation = useMutation({
    mutationFn: (invitationId: string) => acceptInvitationFn({ data: { invitationId } }),
  })

  const declineMutation = useMutation({
    mutationFn: (invitationId: string) => declineInvitationFn({ data: { invitationId } }),
  })

  const handleAccept = async () => {
    const currentToken = await getAuthToken()
    if (!currentToken) {
      toast.info("Please sign up or sign in to accept the invitation")
      navigate({
        to: "/auth/sign-up",
        search: {
          redirect: window.location.href,
        },
      })
      return
    }

    setStatus("loading")
    try {
      await acceptMutation.mutateAsync(id)
      setStatus("success")
      toast.success("Successfully joined the organization")
    } catch (error: any) {
      setStatus("error")
      setErrorMessage(error?.message || "Failed to accept the invitation")
    }
  }

  const handleSwitchAccount = async () => {
    await deleteAuthToken()
    queryClient.clear()
    navigate({
      to: "/auth/sign-in",
      search: {
        redirect: window.location.href,
      },
    })
  }

  const handleDecline = async () => {
    setStatus("loading")
    try {
      await declineMutation.mutateAsync(id)
      toast.success("Invitation declined")
      navigate({ to: "/dashboard" })
    } catch (error: any) {
      setStatus("error")
      setErrorMessage(error?.message || "Failed to decline the invitation")
    }
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {invitation ? `Invitation to join ${invitation.project?.name || invitation.team?.name}` : "Invitation to join"}
          </CardTitle>
          <CardDescription>
            {invitation 
              ? (
                <div className="flex flex-col gap-1">
                  <p>
                    You have been invited by <b>{invitation.inviter?.name}</b> to join their {invitation.project_id ? "project" : "team"}.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Invitation sent to: <span className="font-medium">{invitation.email}</span>
                  </p>
                </div>
              )
              : "You have been invited to join an organization. Click below to accept the invitation and gain access."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 py-6">
          {isEmailMismatch && status === "idle" && (
            <Alert variant="destructive" className="bg-destructive/5 border-destructive/20">
              <AlertCircle className="size-4" />
              <AlertTitle>Account Mismatch</AlertTitle>
              <AlertDescription className="text-xs">
                You are currently logged in as <span className="font-semibold">{currentUser.email}</span>. 
                This invitation is intended for <span className="font-semibold">{invitation.email}</span>. 
                Please switch accounts to accept.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col items-center justify-center gap-4">
            {(status === "idle" || isLoading) && (
              <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                {isLoading ? <Loader2 className="size-8 animate-spin" /> : <CheckCircle2 className="size-8" />}
              </div>
            )}
            {status === "loading" && (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="size-8 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Processing...</span>
              </div>
            )}
            {status === "success" && (
              <div className="flex flex-col items-center gap-2">
                <div className="flex size-16 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-500">
                  <CheckCircle2 className="size-8" />
                </div>
                <span className="font-medium text-green-600 dark:text-green-500">Accepted Successfully!</span>
              </div>
            )}
            {status === "error" && (
              <div className="flex flex-col items-center gap-2">
                <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                  <XCircle className="size-8" />
                </div>
                <span className="text-center font-medium text-destructive">{errorMessage}</span>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex w-full flex-col gap-2">
          {status === "idle" && (
            isEmailMismatch ? (
              <Button className="w-full" onClick={handleSwitchAccount} size="lg" variant="outline">
                <LogOut className="size-4 mr-2" />
                Switch Account
              </Button>
            ) : (
              <Button className="w-full" onClick={handleAccept} size="lg">
                Accept Invitation
              </Button>
            )
          )}
          {status === "success" && (
            <Button className="w-full" onClick={() => navigate({ to: "/dashboard" })} size="lg">
              Go to Dashboard
            </Button>
          )}
          {(status === "error" || status === "idle") && (
            <Button variant="ghost" className="w-full" onClick={status === "idle" ? handleDecline : () => navigate({ to: "/dashboard" })}>
              {status === "error" ? "Return to Dashboard" : "Decline"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
