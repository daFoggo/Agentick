import { useQuery } from "@tanstack/react-query"
import { Loader2, Plus } from "lucide-react"
import { useDeferredValue, useState } from "react"
import { toast } from "sonner"
import { useProjectMemberMutations } from "../queries"
import type { TProjectRole } from "../schemas"
import { userQueries, type TUserSearchResult } from "@/features/users"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ASSIGNABLE_ROLES } from "@/constants/team-roles"

interface IInviteProjectMemberDialogProps {
  projectId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const InviteProjectMemberDialog = ({
  projectId,
  open,
  onOpenChange,
}: IInviteProjectMemberDialogProps) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUsers, setSelectedUsers] = useState<TUserSearchResult[]>([])
  const [selectedRole, setSelectedRole] = useState<TProjectRole>("member")
  const deferredQuery = useDeferredValue(searchQuery)

  const anchor = useComboboxAnchor()

  // Use global user search with smart exclusion
  const { data: users = [], isLoading } = useQuery(
    userQueries.search(deferredQuery, { excludeProjectId: projectId })
  )

  const { addMember } = useProjectMemberMutations()

  const handleAdd = async () => {
    if (selectedUsers.length === 0) return

    try {
      await Promise.all(
        selectedUsers.map((user) =>
          addMember.mutateAsync({
            projectId: projectId,
            payload: { user_id: user.id, role: selectedRole },
          })
        )
      )
      toast.success(
        `${selectedUsers.length} members have been added to the project`
      )
      handleReset()
      onOpenChange(false)
    } catch (error) {
      toast.error("Failed to add some members")
    }
  }

  const handleReset = () => {
    setSearchQuery("")
    setSelectedUsers([])
    setSelectedRole("member")
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      handleReset()
    }
    onOpenChange(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:min-w-md">
        <DialogHeader>
          <DialogTitle>Invite member</DialogTitle>
          <DialogDescription>
            Search by name or email to find and invite a user to your project.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <Field>
            <FieldLabel>Users</FieldLabel>
            <Combobox
              multiple
              autoHighlight
              items={users}
              itemToStringValue={(user) => user.name}
              value={selectedUsers}
              onValueChange={(vals) => {
                setSelectedUsers(vals as TUserSearchResult[])
              }}
              onInputValueChange={setSearchQuery}
            >
              <ComboboxChips ref={anchor} className="w-full">
                <ComboboxValue>
                  {(values: TUserSearchResult[]) => (
                    <>
                      {values.map((user) => (
                        <ComboboxChip key={user.id}>{user.name}</ComboboxChip>
                      ))}
                      <ComboboxChipsInput
                        placeholder="Search by name or email..."
                        autoComplete="one-time-code"
                      />
                    </>
                  )}
                </ComboboxValue>
              </ComboboxChips>
              <ComboboxContent anchor={anchor}>
                <ComboboxEmpty>
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2 py-2">
                      <Loader2 className="size-4 animate-spin text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Searching...
                      </span>
                    </div>
                  ) : (
                    "No users found."
                  )}
                </ComboboxEmpty>
                <ComboboxList>
                  {(user: TUserSearchResult) => (
                    <ComboboxItem key={user.id} value={user}>
                      <Avatar className="size-6">
                        <AvatarImage src={user.avatar_url ?? undefined} />
                        <AvatarFallback>
                          {user.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{user.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {user.email}
                        </span>
                      </div>
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </Field>

          <Field>
            <FieldLabel>Role</FieldLabel>
            <Select
              value={selectedRole}
              onValueChange={(val) => setSelectedRole(val as TProjectRole)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="p-1">
                {ASSIGNABLE_ROLES.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    <div className="flex items-center gap-2">
                      <role.icon className="size-3.5" />
                      {role.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => handleOpenChange(false)}
            disabled={addMember.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleAdd}
            disabled={selectedUsers.length === 0 || addMember.isPending}
          >
            {addMember.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Adding...</span>
              </>
            ) : (
              <>
                <Plus className="size-4" />
                <span>Invite Member</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
