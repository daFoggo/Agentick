import {
  DndContext,
  DragOverlay,
  pointerWithin,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  MeasuringStrategy,
  defaultDropAnimationSideEffects,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable"
import { useMemo, useState, useEffect } from "react"
import { toast } from "sonner"
import {
  type TTaskStatus,
  type TTaskType,
  type TTaskPriority,
  useTaskConfigMutations,
} from "@/features/task-config"
import { useTaskMutations } from "../../queries"
import type { TTask } from "../../schemas"
import { KanbanCard } from "./kanban-card"
import { KanbanColumn } from "./kanban-column"
import { CreateTaskListDialog } from "../task-table/create-task-list-dialog"
import { EditTaskListDialog } from "../task-table/edit-task-list-dialog"
import { DeleteTaskListDialog } from "../task-table/delete-task-list-dialog"
import { useKanbanStore } from "../../stores/kanban-store"

interface TaskKanbanProps {
  projectId: string
  tasks: TTask[]
  statuses: TTaskStatus[]
  types: TTaskType[]
  priorities: TTaskPriority[]
  members: any[]
}

export const TaskKanban = ({
  projectId,
  tasks: initialTasks,
  statuses,
  types,
  priorities,
  members,
}: TaskKanbanProps): React.ReactNode => {
  const { setColumnOrder } = useKanbanStore()
  
  const [tasks, setTasks] = useState<TTask[]>(initialTasks)
  const [activeTask, setActiveTask] = useState<TTask | null>(null)
  const [activeColumn, setActiveColumn] = useState<TTaskStatus | null>(null)
  const [selectedTask, setSelectedTask] = useState<TTask | null>(null)
  const [taskToDelete, setTaskToDelete] = useState<TTask | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [defaultStatusId, setDefaultStatusId] = useState<string | undefined>()

  const { update, remove } = useTaskMutations()
  const { updateStatus } = useTaskConfigMutations()

  useEffect(() => {
    setTasks(initialTasks)
  }, [initialTasks])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Custom collision detection to ignore Y-axis for columns, making horizontal dragging flawless
  const customCollisionDetection = (args: any) => {
    // 1. If we are dragging a column, only check X-axis intersection
    if (args.active.data.current?.type === "column") {
      const activeRect = args.active.rect.current?.translated
      if (!activeRect) return pointerWithin(args)

      const columnContainers = args.droppableContainers.filter(
        (c: any) => c.data.current?.type === "column" && c.id !== args.active.id
      )

      let closestId = null
      let maxIntersectionRatio = 0

      for (const container of columnContainers) {
        const targetRect = container.rect.current
        if (!targetRect) continue

        // Calculate horizontal overlap
        const overlapLeft = Math.max(activeRect.left, targetRect.left)
        const overlapRight = Math.min(activeRect.right, targetRect.right)
        const overlapX = overlapRight - overlapLeft

        if (overlapX > 0) {
          const intersectionRatio = overlapX / activeRect.width
          if (intersectionRatio > maxIntersectionRatio) {
            maxIntersectionRatio = intersectionRatio
            closestId = container.id
          }
        }
      }

      // If we overlap more than 20% horizontally, trigger the swap
      if (closestId && maxIntersectionRatio > 0.2) {
        return [{ id: closestId, data: { droppableContainer: args.droppableContainers.find((c: any) => c.id === closestId) } }]
      }
      return []
    }

    // 2. For cards, use standard pointerWithin
    return pointerWithin(args)
  }

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const data = active.data.current
    if (data?.type === "column") {
      setActiveColumn(statuses.find((s) => s.id === active.id) || null)
    } else if (data?.type === "card") {
      setActiveTask(data.task || null)
    }
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    if (activeId === overId) return
    
    // Return early if dragging a column
    if (active.data.current?.type === "column") return

    const isActiveCard = active.data.current?.type === "card"
    const isOverCard = over.data.current?.type === "card"
    const isOverColumn = over.data.current?.type === "column"

    if (!isActiveCard) return

    if (isOverColumn) {
      setTasks((prev) => {
        const activeIndex = prev.findIndex((t) => t.id === activeId)
        if (prev[activeIndex].status_id !== overId) {
          const newTasks = [...prev]
          newTasks[activeIndex] = { ...newTasks[activeIndex], status_id: overId }
          return arrayMove(newTasks, activeIndex, activeIndex) // trigger re-render
        }
        return prev
      })
    } else if (isOverCard) {
      const overTaskStatusId = over.data.current?.task?.status_id
      if (!overTaskStatusId) return

      setTasks((prev) => {
        const activeIndex = prev.findIndex((t) => t.id === activeId)
        const overIndex = prev.findIndex((t) => t.id === overId)

        if (prev[activeIndex].status_id !== overTaskStatusId) {
          const newTasks = [...prev]
          newTasks[activeIndex] = { ...newTasks[activeIndex], status_id: overTaskStatusId }
          return arrayMove(newTasks, activeIndex, overIndex)
        }

        return arrayMove(prev, activeIndex, overIndex)
      })
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    // Cleanup active states
    const draggedColumn = activeColumn
    const draggedTask = activeTask
    setActiveColumn(null)
    setActiveTask(null)

    if (!over) return
    
    const activeId = active.id as string
    const overId = over.id as string

    // Handle column drop
    if (draggedColumn) {
      if (activeId !== overId) {
        const activeIndex = statuses.findIndex((s) => s.id === activeId)
        const overIndex = statuses.findIndex((s) => s.id === overId)
        
        if (activeIndex !== -1 && overIndex !== -1) {
          const newStatuses = arrayMove(statuses, activeIndex, overIndex)
          setColumnOrder(projectId, newStatuses.map((s) => s.id))
          updateStatus.mutate({
            projectId,
            statusId: activeId,
            payload: { order: overIndex },
          })
        }
      }
      return
    }

    // Handle card drop
    if (draggedTask) {
      const currentTask = tasks.find(t => t.id === activeId)
      if (!currentTask) return
      
      const initialTask = initialTasks.find(t => t.id === activeId)
      
      // If status changed, notify server
      if (currentTask.status_id !== initialTask?.status_id) {
        update.mutate({
          projectId,
          taskId: activeId,
          payload: { status_id: currentTask.status_id },
        })
      }
    }
  }

  const taskOptions = useMemo(() => ({
    statuses,
    types,
    priorities,
    members,
  }), [statuses, types, priorities, members])

  const nextOrder = useMemo(() => 
    tasks.reduce((max, t) => Math.max(max, t.order ?? -1), -1) + 1,
  [tasks])

  const handleTaskClick = (task: TTask) => {
    setSelectedTask(task)
    setIsEditOpen(true)
  }

  const handleDeleteTask = (task: TTask) => {
    setTaskToDelete(task)
    setIsDeleteOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!taskToDelete) return false
    try {
      await remove.mutateAsync({
        projectId: taskToDelete.project_id,
        taskId: taskToDelete.id,
      })
      toast.success("Task deleted successfully")
      return true
    } catch (error) {
      toast.error("Failed to delete task")
      return false
    }
  }

  const handleAddTask = (statusId: string) => {
    setDefaultStatusId(statusId)
    setIsCreateOpen(true)
  }

  const dropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: "0.4",
        },
      },
    }),
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden no-scrollbar">
      <DndContext
        sensors={sensors}
        collisionDetection={customCollisionDetection}
        measuring={{
          droppable: {
            strategy: MeasuringStrategy.Always,
          },
        }}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="h-full w-full overflow-x-auto  border-none bg-background/50 no-scrollbar">
          <div className="flex min-w-full min-h-[calc(100vh-200px)] items-start gap-6 py-6 pr-6 pl-[60px] no-scrollbar">
            <SortableContext items={statuses.map(s => s.id)} strategy={horizontalListSortingStrategy}>
              {statuses.map((status) => (
                <KanbanColumn
                  key={status.id}
                  id={status.id}
                  title={status.name}
                  tasks={tasks.filter((t) => t.status_id === status.id)}
                  onTaskClick={handleTaskClick}
                  onDeleteTask={handleDeleteTask}
                  onAddTask={handleAddTask}
                />
              ))}
            </SortableContext>
          </div>
        </div>

        <DragOverlay dropAnimation={dropAnimation}>
          {activeColumn && (
            <div className="w-[260px] opacity-90 shadow-2xl scale-105 -rotate-2 cursor-grabbing pointer-events-none transition-transform">
              <KanbanColumn
                id={activeColumn.id}
                title={activeColumn.name}
                tasks={tasks.filter((t) => t.status_id === activeColumn.id)}
                onTaskClick={() => {}}
                onAddTask={() => {}}
                isOverlay
              />
            </div>
          )}
          {activeTask && (
            <div className="w-[260px] opacity-90 shadow-2xl scale-105 -rotate-2 cursor-grabbing pointer-events-none transition-transform">
              <KanbanCard 
                task={activeTask} 
                onClick={() => {}} 
                isOverlay 
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <CreateTaskListDialog
        projectId={projectId}
        nextOrder={nextOrder}
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        options={taskOptions}
        defaultStatusId={defaultStatusId}
      />

      {selectedTask && (
        <EditTaskListDialog
          task={selectedTask}
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          options={taskOptions}
        />
      )}

      {taskToDelete && (
        <DeleteTaskListDialog
          task={taskToDelete}
          open={isDeleteOpen}
          onOpenChange={setIsDeleteOpen}
          isPending={remove.isPending}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  )
}
