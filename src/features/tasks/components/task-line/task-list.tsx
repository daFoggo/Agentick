import {
  Empty,
  EmptyDescription,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ListTodo } from "lucide-react"
import type { TTask } from "../../schemas"
import { TaskItem } from "./task-item"

interface TaskListProps {
  tasks: Partial<TTask>[]
}

export const TaskList = ({ tasks }: TaskListProps) => {
  return (
    <ScrollArea className="h-64">
      <div className="flex flex-col">
        {tasks.length === 0 ? (
          <Empty className="h-full border-none shadow-none">
            <EmptyMedia variant="icon">
              <ListTodo />
            </EmptyMedia>
            <EmptyTitle>No tasks found</EmptyTitle>
            <EmptyDescription>
              You don't have any tasks in this category.
            </EmptyDescription>
          </Empty>
        ) : (
          tasks.map((task) => <TaskItem key={task.id} task={task} />)
        )}
      </div>
    </ScrollArea>
  )
}
