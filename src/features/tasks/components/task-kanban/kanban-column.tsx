import { useDroppable } from "@dnd-kit/core"
import { verticalListSortingStrategy, SortableContext, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { KanbanCard } from "./kanban-card"
import { Button } from "@/components/ui/button"
import { Plus, GripVertical } from "lucide-react"
import { type TTask } from "../../schemas"
import { cn } from "@/lib/utils"

interface KanbanColumnProps {
  id: string
  title: string
  tasks: TTask[]
  onTaskClick: (task: TTask) => void
  onDeleteTask?: (task: TTask) => void
  onAddTask: (statusId: string) => void
  isOverlay?: boolean
}

export const KanbanColumn = ({
  id,
  title,
  tasks,
  onTaskClick,
  onDeleteTask,
  onAddTask,
  isOverlay,
}: KanbanColumnProps) => {
  const {
    setNodeRef: setSortableRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    disabled: isOverlay,
    data: {
      type: "column",
      title,
    },
  })

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id,
    disabled: isOverlay,
    data: {
      type: "column",
    },
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging && !isOverlay ? 0.3 : 1,
  }

  return (
    <div
      ref={setSortableRef}
      style={style}
      className="flex w-[260px] shrink-0 flex-col gap-3"
    >
      <div className="flex items-center justify-between px-1 pb-2">
        <div 
          className="flex min-w-0 flex-1 cursor-grab items-center gap-2 py-2 active:cursor-grabbing"
          {...(isOverlay ? {} : attributes)}
          {...(isOverlay ? {} : listeners)}
        >
          <GripVertical className="size-4 text-muted-foreground/40" />
          <h3 className="truncate text-sm font-bold uppercase tracking-widest text-muted-foreground/80">
            {title}
          </h3>
          <span className="shrink-0 rounded bg-muted/50 px-2 py-0.5 text-xs font-bold text-muted-foreground">
            {tasks.length}
          </span>
        </div>
        {!isOverlay && (
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground/60 hover:bg-muted hover:text-foreground"
            onClick={() => onAddTask(id)}
          >
            <Plus className="size-4" />
          </Button>
        )}
      </div>

      <div
        ref={setDroppableRef}
        className={cn(
          "flex max-h-[580px] flex-col gap-3 overflow-y-auto overflow-x-hidden rounded-2xl p-1.5 transition-colors duration-200 no-scrollbar",
          isOver && !isOverlay
            ? "bg-muted/40 ring-2 ring-primary/20 ring-inset"
            : "bg-muted/20"
        )}
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <KanbanCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick(task)}
              onDelete={onDeleteTask ? () => onDeleteTask(task) : undefined}
              isOverlay={isOverlay}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  )
}
