import { useForm } from "@tanstack/react-form"
import { Loader2 } from "lucide-react"
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
  type ITaskListDialogOptions,
  resolveDefaultTaskOptionIds,
  toCalendarDateValue,
  toIsoDateTime,
} from "@/features/tasks/helpers"
import { useTaskMutations } from "@/features/tasks/queries"
import { CreateTaskSchema } from "@/features/tasks/schemas"

interface ICreateTaskListDialogProps {
  projectId: string
  nextOrder: number
  open: boolean
  onOpenChange: (open: boolean) => void
  options: ITaskListDialogOptions
}

export const CreateTaskListDialog = ({
  projectId,
  nextOrder,
  open,
  onOpenChange,
  options,
}: ICreateTaskListDialogProps) => {
  const { create } = useTaskMutations()

  const defaults = resolveDefaultTaskOptionIds(options)
  const now = new Date()
  const due = new Date(now.getTime() + 24 * 60 * 60 * 1000)

  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      status_id: defaults.statusId,
      type_id: defaults.typeId,
      priority_id: defaults.priorityId,
      assigner_id: defaults.assignerId,
      assignee_ids: [] as string[],
      start_date: toCalendarDateValue(now) ?? now,
      due_date: toCalendarDateValue(due) ?? due,
      order: nextOrder,
    },
    validators: {
      onSubmit: CreateTaskSchema as any,
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
        await create.mutateAsync({
          projectId,
          payload: {
            title: value.title,
            description: value.description || null,
            status_id: value.status_id,
            type_id: value.type_id,
            priority_id: value.priority_id,
            assigner_id: value.assigner_id,
            assignee_ids: value.assignee_ids,
            start_date: startDateIso,
            due_date: dueDateIso,
            order: value.order,
          },
        })
        toast.success("Task created successfully")
        onOpenChange(false)
        form.reset()
      } catch (error) {
        toast.error("Failed to create task")
        console.error(error)
      }
    },
  })

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
            <DialogTitle>Create new task</DialogTitle>
            <DialogDescription>
              Add a new task for list view management.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>
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
                        value={field.state.value}
                        onValueChange={field.handleChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select assigner" />
                        </SelectTrigger>
                        <SelectContent>
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
              disabled={create.isPending}
            >
              Cancel
            </Button>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit]) => (
                <Button type="submit" disabled={!canSubmit || create.isPending}>
                  {create.isPending && (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  )}
                  Create Task
                </Button>
              )}
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
