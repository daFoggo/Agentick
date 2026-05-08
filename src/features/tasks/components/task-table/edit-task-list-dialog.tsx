import { useForm } from "@tanstack/react-form"
import { Loader2 } from "lucide-react"
import { useEffect } from "react"
import { toast } from "sonner"

import { DateTimePicker } from "@/components/common/date-picker"
import { MultiSelectCombobox } from "@/components/common/multi-select-combobox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  resolveDefaultTaskOptionIds,
  toCalendarDateValue,
  toIsoDateTime,
  type ITaskListDialogOptions,
} from "@/features/tasks/helpers"
import { useTaskMutations } from "@/features/tasks/queries"
import { UpdateTaskSchema, type TTask } from "@/features/tasks/schemas"

interface IEditTaskListDialogProps {
  task: TTask
  open: boolean
  onOpenChange: (open: boolean) => void
  options: ITaskListDialogOptions
}

export const EditTaskListDialog = ({
  task,
  open,
  onOpenChange,
  options,
}: IEditTaskListDialogProps) => {
  const { update } = useTaskMutations()

  const defaults = resolveDefaultTaskOptionIds(options)

  const form = useForm({
    defaultValues: {
      title: task.title,
      description: task.description ?? "",
      status_id: task.status_id ?? defaults.statusId,
      type_id: task.type_id ?? defaults.typeId,
      priority_id: task.priority_id ?? defaults.priorityId,
      assigner_id: task.assigner_id || defaults.assignerId,
      assignee_ids: task.assignee_ids ?? [],
      start_date: toCalendarDateValue(task.start_date) ?? new Date(),
      due_date: toCalendarDateValue(task.due_date) ?? new Date(),
      order: task.order ?? 0,
    },
    validators: {
      onSubmit: UpdateTaskSchema as any,
    },
    onSubmit: async ({ value }) => {
      const startDate =
        value.start_date instanceof Date ? value.start_date : undefined
      const dueDate =
        value.due_date instanceof Date ? value.due_date : undefined
      const startDateIso = toIsoDateTime(startDate)
      const dueDateIso = toIsoDateTime(dueDate)

      if (!startDateIso || !dueDateIso) {
        toast.error("Ngày giờ không hợp lệ")
        return
      }

      try {
        await update.mutateAsync({
          projectId: task.project_id,
          taskId: task.id,
          payload: {
            title: value.title,
            description: value.description || null,
            status_id: value.status_id,
            type_id: value.type_id,
            priority_id: value.priority_id,
            assigner_id: value.assigner_id || undefined,
            assignee_ids: value.assignee_ids,
            start_date: startDateIso,
            due_date: dueDateIso,
            order: value.order,
          },
        })
        toast.success("Task updated successfully")
        onOpenChange(false)
      } catch (error) {
        toast.error("Failed to update task")
        console.error(error)
      }
    },
  })

  useEffect(() => {
    if (!open) return

    form.reset({
      title: task.title,
      description: task.description ?? "",
      status_id: task.status_id ?? defaults.statusId,
      type_id: task.type_id ?? defaults.typeId,
      priority_id: task.priority_id ?? defaults.priorityId,
      assigner_id: task.assigner_id || defaults.assignerId,
      assignee_ids: task.assignee_ids ?? [],
      start_date: toCalendarDateValue(task.start_date) ?? new Date(),
      due_date: toCalendarDateValue(task.due_date) ?? new Date(),
      order: task.order ?? 0,
    })
  }, [open, task])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:min-w-xl">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
          className="flex flex-col gap-4"
        >
          <DialogHeader>
            <DialogTitle>Edit task</DialogTitle>
            <DialogDescription>
              Update task information and assignments.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>
            <Field>
              <FieldLabel>Project</FieldLabel>
              <Input value={task.project_id} disabled className="bg-muted" />
            </Field>

            <form.Field
              name="title"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !!field.state.meta.errors.length
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Title</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="e.g. Build task CRUD dialog"
                      aria-invalid={isInvalid}
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )
              }}
            />

            <form.Field
              name="description"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !!field.state.meta.errors.length
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                    <Textarea
                      id={field.name}
                      name={field.name}
                      value={field.state.value ?? ""}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Task details"
                      aria-invalid={isInvalid}
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )
              }}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <form.Field
                name="status_id"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched &&
                    !!field.state.meta.errors.length
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Status</FieldLabel>
                      <Select
                        value={field.state.value}
                        onValueChange={field.handleChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {options.statuses.map((status) => (
                            <SelectItem key={status.id} value={status.id}>
                              {status.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FieldError errors={field.state.meta.errors} />
                    </Field>
                  )
                }}
              />

              <form.Field
                name="type_id"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched &&
                    !!field.state.meta.errors.length
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Type</FieldLabel>
                      <Select
                        value={field.state.value}
                        onValueChange={field.handleChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {options.types.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FieldError errors={field.state.meta.errors} />
                    </Field>
                  )
                }}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <form.Field
                name="priority_id"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched &&
                    !!field.state.meta.errors.length
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Priority</FieldLabel>
                      <Select
                        value={field.state.value}
                        onValueChange={field.handleChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          {options.priorities.map((priority) => (
                            <SelectItem key={priority.id} value={priority.id}>
                              {priority.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FieldError errors={field.state.meta.errors} />
                    </Field>
                  )
                }}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <form.Field
                name="assigner_id"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched &&
                    !!field.state.meta.errors.length
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Assigner</FieldLabel>
                      <Select
                        value={field.state.value || "unassigned"}
                        onValueChange={(selectedValue) =>
                          field.handleChange(
                            selectedValue === "unassigned" ? "" : selectedValue
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select assigner" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassigned">Unassigned</SelectItem>
                          {options.members.map((member) => (
                            <SelectItem key={member.id} value={member.id}>
                              <div className="flex items-center gap-2">
                                <Avatar className="size-5">
                                  <AvatarImage src={member.user?.avatar_url} />
                                  <AvatarFallback>
                                    {member.user?.name?.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm">
                                  {member.user?.name ?? member.user_id}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FieldError errors={field.state.meta.errors} />
                    </Field>
                  )
                }}
              />

              <form.Field
                name="assignee_ids"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched &&
                    !!field.state.meta.errors.length
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Assignees</FieldLabel>
                      <MultiSelectCombobox
                        items={options.members}
                        value={options.members.filter((m) =>
                          field.state.value.includes(m.id)
                        )}
                        onValueChange={(vals) =>
                          field.handleChange(vals.map((m) => m.id))
                        }
                        itemToString={(m) => m.user?.name || ""}
                        itemToValue={(m) => m.id}
                        placeholder="Select assignees..."
                        renderItem={(m) => (
                          <div className="flex items-center gap-2">
                            <Avatar className="size-6">
                              <AvatarImage src={m.user?.avatar_url} />
                              <AvatarFallback>
                                {m.user?.name?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">
                                {m.user?.name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {m.user?.email}
                              </span>
                            </div>
                          </div>
                        )}
                      />
                      <FieldError errors={field.state.meta.errors} />
                    </Field>
                  )
                }}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <form.Field
                name="start_date"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched &&
                    !!field.state.meta.errors.length
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel>Start Date</FieldLabel>
                      <DateTimePicker
                        date={
                          field.state.value instanceof Date
                            ? field.state.value
                            : new Date()
                        }
                        onChange={field.handleChange}
                      />
                      <FieldError errors={field.state.meta.errors} />
                    </Field>
                  )
                }}
              />

              <form.Field
                name="due_date"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched &&
                    !!field.state.meta.errors.length
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel>Due Date</FieldLabel>
                      <DateTimePicker
                        date={
                          field.state.value instanceof Date
                            ? field.state.value
                            : new Date()
                        }
                        onChange={field.handleChange}
                      />
                      <FieldError errors={field.state.meta.errors} />
                    </Field>
                  )
                }}
              />
            </div>
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={update.isPending}
            >
              Cancel
            </Button>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit]) => (
                <Button type="submit" disabled={!canSubmit || update.isPending}>
                  {update.isPending && (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  )}
                  Update Task
                </Button>
              )}
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
