import { Button } from "@/components/ui/button"
import { Plus, Users } from "lucide-react"

export const TeamsHeader = () => {
  return (
    <div className="flex w-full items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <div className="rounded-md border bg-muted p-2">
          <Users className="size-4" />
        </div>
        <p className="text-xl font-semibold text-foreground">Teams</p>
      </div>

      <div className="flex items-center gap-4">
        <Button
          size="sm"
          className="gap-2 bg-primary shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-95"
        >
          <Plus className="size-4" />
          <span>Create New Team</span>
        </Button>
      </div>
    </div>
  )
}
