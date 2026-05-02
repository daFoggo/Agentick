import { Bell, Check, X, Loader2 } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { invitationQueries, useInvitationMutations, type TInvitation } from "@/features/invitations"
import { formatDistanceToNow } from "date-fns"
import { useState } from "react"

export const NotificationBell = () => {
  const [open, setOpen] = useState(false)
  const { data: invitations = [], isLoading } = useQuery(invitationQueries.my())
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-5 text-muted-foreground" />
          {invitations.length > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 size-5 flex items-center justify-center p-0 text-[10px]"
            >
              {invitations.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h4 className="font-semibold text-sm">Invitations</h4>
          <Badge variant="secondary" className="text-xs">
            {invitations.length} new
          </Badge>
        </div>
        
        <div className="max-h-[300px] overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center p-4">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            </div>
          ) : invitations.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              You have no pending invitations.
            </div>
          ) : (
            <div className="flex flex-col">
              {invitations.map((invitation) => (
                <InvitationItem 
                  key={invitation.id} 
                  invitation={invitation} 
                  onActionComplete={() => {
                    if (invitations.length === 1) setOpen(false)
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function InvitationItem({ 
  invitation,
  onActionComplete
}: { 
  invitation: TInvitation
  onActionComplete: () => void 
}) {
  const { accept, decline } = useInvitationMutations()
  const targetName = invitation.project?.name || invitation.team?.name || "an organization"
  const targetType = invitation.project_id ? "project" : "team"
  
  return (
    <div className="flex flex-col gap-2 p-4 border-b last:border-0 hover:bg-muted/50 transition-colors">
      <div className="flex justify-between items-start gap-2">
        <div className="flex flex-col gap-1">
          <p className="text-sm">
            <span className="font-semibold">{invitation.inviter?.name || "Someone"}</span> invited you to join the {targetType} <span className="font-semibold">{targetName}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(invitation.created_at), { addSuffix: true })}
          </p>
        </div>
      </div>
      
      <div className="flex gap-2 mt-2">
        <Button 
          size="sm" 
          className="w-full flex-1 h-8"
          disabled={accept.isPending || decline.isPending}
          onClick={() => {
            accept.mutate(invitation.id, {
              onSuccess: onActionComplete
            })
          }}
        >
          {accept.isPending ? <Loader2 className="size-3 animate-spin mr-1" /> : <Check className="size-3 mr-1" />}
          Accept
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          className="w-full flex-1 h-8"
          disabled={accept.isPending || decline.isPending}
          onClick={() => {
            decline.mutate(invitation.id, {
              onSuccess: onActionComplete
            })
          }}
        >
          {decline.isPending ? <Loader2 className="size-3 animate-spin mr-1" /> : <X className="size-3 mr-1" />}
          Decline
        </Button>
      </div>
    </div>
  )
}
