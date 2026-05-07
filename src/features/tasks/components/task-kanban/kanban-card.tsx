import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent } from "@/components/ui/card"
import { MemberAvatarGroup } from "@/components/common/member-avatar-group"
import { formatCalendarDate } from "../../helpers"
import { Calendar, Flag, MessageSquare, ListTodo, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { TTask } from "../../schemas"

interface KanbanCardProps {
  task: TTask
  onClick: () => void
  onDelete?: () => void
  isOverlay?: boolean
}

export const KanbanCard = ({ task, onClick, onDelete, isOverlay }: KanbanCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    disabled: isOverlay,
    data: {
      type: "card",
      task,
    },
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging && !isOverlay ? 0.3 : 1,
    zIndex: isDragging && !isOverlay ? 50 : undefined,
  }

  const isOverdue = task.due_date ? new Date(task.due_date) < new Date() : false

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(isOverlay ? {} : attributes)}
      {...(isOverlay ? {} : listeners)}
      className="group relative mb-3 cursor-grab active:cursor-grabbing"
      onClick={(e) => {
        if (isOverlay) return
        e.stopPropagation()
        onClick()
      }}
    >
      <Card className="group/card relative overflow-hidden border border-muted-foreground/20 bg-card shadow-[0_4px_12px_rgba(0,0,0,0.1)] ring-1 ring-inset ring-white/10 transition-all duration-200 hover:border-primary/50 hover:bg-accent/5 hover:shadow-[0_12px_24px_rgba(0,0,0,0.2)]">
        {!isOverlay && onDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1.5 top-1.5 z-10 size-6 text-muted-foreground/60 opacity-0 transition-opacity hover:bg-destructive/15 hover:text-destructive group-hover/card:opacity-100"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
          >
            <X className="size-3.5" />
          </Button>
        )}
        <CardContent className="p-3.5">
          {/* Top Row: Type Logo and Priority Flag */}
          <div className="mb-3.5 flex items-center justify-between">
            <div
              className="flex h-6 items-center rounded-md px-2.5 text-[10px] font-black uppercase tracking-widest shadow-sm ring-1 ring-inset"
              style={{
                backgroundColor: task.type_color ? `${task.type_color}20` : 'transparent',
                color: task.type_color || 'inherit',
                border: task.type_color ? `1px solid ${task.type_color}40` : '1px solid currentColor',
                boxShadow: task.type_color ? `inset 0 0 0 1px ${task.type_color}20` : undefined,
              }}
            >
              {task.type}
            </div>
            
            {task.priority && (
              <div 
                className="flex items-center gap-1.5 rounded-full bg-muted/30 px-2 py-0.5 text-[9px] font-bold"
                style={{ color: task.priority_color || 'inherit' }}
              >
                <Flag className="size-2.5 fill-current" />
                <span className="uppercase tracking-tight">{task.priority}</span>
              </div>
            )}
          </div>

          {/* Main Content: Title and Indicators */}
          <div className="mb-4">
            <h4 className="line-clamp-2 text-[14px] font-semibold leading-tight text-foreground/90 group-hover:text-foreground">
              {task.title}
            </h4>
            
            {/* Small indicators for description/subtasks if any */}
            {(task.description || task.parent_id) && (
              <div className="mt-2 flex items-center gap-2 text-muted-foreground/40">
                {task.description && <MessageSquare className="size-3" />}
                {task.parent_id && <ListTodo className="size-3" />}
              </div>
            )}
          </div>

          {/* Footer Row: Date and Assignees */}
          <div className="flex items-center justify-between border-t border-muted-foreground/5 pt-3">
            <div className="flex items-center">
              {task.due_date && (
                <div
                  className={`flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[10px] font-medium transition-colors ${
                    isOverdue
                      ? "bg-destructive/10 text-destructive"
                      : "bg-muted/30 text-muted-foreground/70"
                  }`}
                >
                  <Calendar className="size-3 opacity-60" />
                  <span>{formatCalendarDate(new Date(task.due_date))}</span>
                </div>
              )}
            </div>

            <div className="flex shrink-0 items-center">
              {task.assignees && task.assignees.length > 0 ? (
                <MemberAvatarGroup
                  items={task.assignees}
                  max={2}
                  size="sm"
                  getAvatarInfo={(a) => ({
                    id: a.id,
                    name: a.user?.name,
                    avatar_url: a.user?.avatar_url,
                  })}
                />
              ) : (
                <div className="size-6 rounded-full border border-dashed border-muted-foreground/15 bg-muted/5" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
