import { useForm } from "@tanstack/react-form"
import { useNavigate, useParams } from "@tanstack/react-router"
import {
  ArrowLeft,
  CalendarDays,
  CircleDashed,
  Clock,
  Flag,
  ListChecks,
  Loader2,
  Save,
  Sparkles,
  TextAlignStart,
  Trash2,
  Users,
} from "lucide-react"
import { useRef, useState } from "react"
import { toast } from "sonner"

import { DateTimePicker } from "@/components/common/date-picker"
import { MultiSelectCombobox } from "@/components/common/multi-select-combobox"
import { TaskPriorityBadge } from "@/components/common/task-priority-badge"
import { TaskStatusBadge } from "@/components/common/task-status-badge"
import { TaskTypeBadge } from "@/components/common/task-type-badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import {
  type ITaskListDialogOptions,
  resolveDefaultTaskOptionIds,
  toCalendarDateValue,
  toIsoDateTime,
} from "@/features/tasks/helpers"
import { useTaskMutations } from "@/features/tasks/queries"
import {
  CreateTaskSchema,
  type TTask,
  UpdateTaskSchema,
} from "@/features/tasks/schemas"
import { DeleteTaskListDialog } from "../task-table/delete-task-list-dialog"
import { TaskAIEstimationAlert } from "../task-table/task-ai-estimation-alert"
import { TaskActivity } from "./task-activity"

interface ITaskDetailViewProps {
  task?: TTask
  options: ITaskListDialogOptions
  isLoading?: boolean
  defaultStatusId?: string
}

type TTaskDetailFormValues = {
  title: string
  description: string
  status_id: string
  type_id: string
  priority_id: string
  member_ids: string[]
  due_date: Date
  order: number
  estimated_hours?: number
}

const buildTaskPayload = (value: TTaskDetailFormValues) => {
  const dueDateIso = toIsoDateTime(
    value.due_date instanceof Date ? value.due_date : undefined
  )

  if (!dueDateIso) return null

  return {
    dueDateIso,
    payload: {
      title: value.title,
      status_id: value.status_id,
      type_id: value.type_id,
      priority_id: value.priority_id,
      member_ids: value.member_ids,
      description: value.description || null,
      due_date: dueDateIso,
      estimated_hours:
        value.estimated_hours !== undefined && value.estimated_hours !== null
          ? Number(value.estimated_hours)
          : null,
    },
  }
}

const serializeTaskFormValues = (value: TTaskDetailFormValues) =>
  JSON.stringify({
    title: value.title,
    description: value.description,
    status_id: value.status_id,
    type_id: value.type_id,
    priority_id: value.priority_id,
    member_ids: value.member_ids,
    due_date:
      value.due_date instanceof Date ? value.due_date.toISOString() : null,
    estimated_hours:
      value.estimated_hours !== undefined && value.estimated_hours !== null
        ? Number(value.estimated_hours)
        : null,
  })

const cloneTaskFormValues = (
  value: TTaskDetailFormValues
): TTaskDetailFormValues => ({
  ...value,
  member_ids: [...value.member_ids],
  due_date:
    value.due_date instanceof Date ? new Date(value.due_date) : new Date(),
})

export const TaskDetailView = ({
  task,
  options,
  isLoading,
  defaultStatusId,
}: ITaskDetailViewProps) => {
  const navigate = useNavigate()
  const { teamId, projectId } = useParams({ strict: false })
  const { update, remove, estimate, create } = useTaskMutations()
  const [aiExplanation, setAiExplanation] = useState<{
    suggested_hours: number
    rationale: string
    reasoning_steps?: any
  } | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const defaults = resolveDefaultTaskOptionIds(options)
  const defaultValues: TTaskDetailFormValues = {
    title: task?.title || "",
    description: task?.description ?? "",
    status_id: task?.status_id ?? defaultStatusId ?? defaults.statusId,
    type_id: task?.type_id ?? defaults.typeId,
    priority_id: task?.priority_id ?? defaults.priorityId,
    member_ids: task?.task_members?.map((m) => m.user_id) ?? [],
    due_date: toCalendarDateValue(task?.due_date) ?? new Date(),
    order: task?.order ?? 0,
    estimated_hours: task?.estimated_hours ?? undefined,
  }
  const lastSavedSignatureRef = useRef(serializeTaskFormValues(defaultValues))
  const autosaveQueueRef = useRef<TTaskDetailFormValues | null>(null)
  const autosaveRunningRef = useRef(false)

  const queueAutosave = async (formApi: any, value: TTaskDetailFormValues) => {
    if (!task?.id) return

    autosaveQueueRef.current = cloneTaskFormValues(value)
    if (autosaveRunningRef.current) return

    autosaveRunningRef.current = true

    try {
      while (autosaveQueueRef.current) {
        const nextValue = autosaveQueueRef.current
        autosaveQueueRef.current = null

        const signature = serializeTaskFormValues(nextValue)
        if (signature === lastSavedSignatureRef.current) {
          continue
        }

        const taskPayload = buildTaskPayload(nextValue)
        if (!taskPayload) {
          toast.error("Invalid dates provided")
          return
        }

        const targetProjectId = projectId || task.project_id
        if (!targetProjectId) {
          toast.error("Project boundary context missing")
          return
        }

        await update.mutateAsync({
          projectId: targetProjectId,
          taskId: task.id,
          payload: taskPayload.payload,
        })

        lastSavedSignatureRef.current = signature

        if (!autosaveQueueRef.current) {
          formApi.reset(cloneTaskFormValues(nextValue))
        }
      }
    } catch (_error) {
      toast.error("Failed to update task")
    } finally {
      autosaveRunningRef.current = false
    }
  }

  const form = useForm({
    defaultValues,
    validators: {
      // Dynamically choose schema if we wanted full validation, but usually Update is looser/safer
      onSubmit: (task ? UpdateTaskSchema : CreateTaskSchema) as any,
    },
    listeners: {
      onChangeDebounceMs: 1000,
      onChange: ({ formApi }) => {
        if (task?.id && formApi.state.isDirty) {
          void queueAutosave(
            formApi,
            formApi.state.values as TTaskDetailFormValues
          )
        }
      },
      onBlur: ({ formApi }) => {
        if (task?.id && formApi.state.isDirty) {
          void queueAutosave(
            formApi,
            formApi.state.values as TTaskDetailFormValues
          )
        }
      },
    },
    onSubmit: async ({ value }) => {
      const taskPayload = buildTaskPayload(value as TTaskDetailFormValues)
      if (!taskPayload) {
        toast.error("Invalid dates provided")
        return
      }

      const targetProjectId = projectId || task?.project_id
      if (!targetProjectId) {
        toast.error("Project boundary context missing")
        return
      }

      try {
        if (task?.id) {
          // Mode: UPDATE
          await update.mutateAsync({
            projectId: targetProjectId,
            taskId: task.id,
            payload: taskPayload.payload,
          })
          toast.success("Task updated successfully")
        } else {
          // Mode: CREATE
          await create.mutateAsync({
            projectId: targetProjectId,
            payload: {
              ...taskPayload.payload,
              project_id: targetProjectId,
              order: 0, // default order or derived if necessary
            } as any,
          })
          toast.success("Task created successfully!")
        }

        if (task?.id) {
          lastSavedSignatureRef.current = serializeTaskFormValues(
            value as TTaskDetailFormValues
          )
          form.reset(cloneTaskFormValues(value as TTaskDetailFormValues))
        }

        // Only eject back to project context if performing absolute creation routines.
        if (!task?.id) {
          navigate({
            to: "/dashboard/$teamId/projects/$projectId/list",
            params: {
              teamId: teamId || "personal",
              projectId: targetProjectId,
            },
          })
        }
      } catch (_error) {
        toast.error(task ? "Failed to update task" : "Failed to create task")
      }
    },
  })

  const handleAIEstimate = async () => {
    const title = form.getFieldValue("title")
    if (!title) {
      toast.error("Please enter a task title first!")
      return
    }
    const targetProjectId = projectId || task?.project_id
    if (!targetProjectId) {
      toast.error("No active project context found for AI prediction")
      return
    }

    try {
      const result = await estimate.mutateAsync({
        projectId: targetProjectId,
        payload: {
          title,
          description: form.getFieldValue("description") || null,
        },
      })
      if (result?.suggested_hours !== undefined) {
        form.setFieldValue("estimated_hours", result.suggested_hours)
        setAiExplanation(result)
      }
    } catch (_err) {
      toast.error("Failed to generate AI estimation")
    }
  }

  const handleConfirmDelete = async () => {
    if (!task?.id) return false
    try {
      await remove.mutateAsync({
        projectId: projectId || task.project_id,
        taskId: task.id,
      })
      toast.success("Task deleted successfully")
      navigate({
        to: "/dashboard/$teamId/projects/$projectId/list",
        params: {
          teamId: teamId || "personal",
          projectId: projectId || task.project_id,
        },
      })
      return true
    } catch {
      toast.error("Failed to delete task")
      return false
    }
  }

  if (isLoading) {
    return (
      <div className="container grid max-w-7xl grid-cols-1 gap-4 p-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-50 w-full" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-100 w-full" />
        </div>
      </div>
    )
  }

  return (
    <>
      <form
        data-slot="task-detail-view"
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
        className="container h-full"
      >
        <Card size="sm">
          <CardHeader className="border-b">
            <CardTitle className="flex flex-1 items-center gap-2 overflow-hidden py-0.5">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() =>
                  navigate({
                    to: "/dashboard/$teamId/projects/$projectId/list",
                    params: {
                      teamId: teamId || "personal",
                      projectId: projectId || task?.project_id || "",
                    },
                  })
                }
                className="shrink-0"
              >
                <ArrowLeft className="size-4" />
              </Button>
              <form.Field name="title">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched &&
                    !!field.state.meta.errors.length
                  return (
                    <div className="w-full max-w-lg">
                      <Input
                        id={field.name}
                        autoFocus
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Edit task title"
                        aria-invalid={isInvalid}
                        className="w-full border-none bg-transparent! text-lg font-semibold transition-colors outline-none hover:bg-muted!"
                      />
                    </div>
                  )
                }}
              </form.Field>
            </CardTitle>
            <CardAction className="flex h-auto items-center gap-2">
              <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting]}>
                {([canSubmit, isSubmitting]) => {
                  const isPending =
                    update.isPending || create.isPending || isSubmitting

                  // CREATE MODE: Persist standard primary CTA to satisfy absolute creation commitments.
                  if (!task) {
                    return (
                      <Button
                        type="submit"
                        size="sm"
                        disabled={!canSubmit || isPending}
                      >
                        {isPending ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Save className="size-4" />
                        )}
                        Create Task
                      </Button>
                    )
                  }

                  // UPDATE MODE: Transposed Active Status Tracker replacing legacy manual engagement buttons.
                  return (
                    <div className="flex items-center gap-2">
                      {isPending ? (
                        <Button
                          variant="ghost"
                          className="flex animate-in items-center gap-2 text-xs font-medium text-muted-foreground duration-500 select-none fade-in"
                        >
                          <Loader2 className="size-3.5 animate-spin" />
                          <span>Saving changes...</span>
                        </Button>
                      ) : null}
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => setIsDeleteDialogOpen(true)}
                        disabled={remove.isPending}
                      >
                        <Trash2 className="size-4" />
                        Delete
                      </Button>
                    </div>
                  )
                }}
              </form.Subscribe>
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
              {/* Main Content Area (60%) */}
              <div className="space-y-6 lg:col-span-3">
                <FieldGroup>
                  <form.Field name="description">
                    {(field) => {
                      const isInvalid =
                        field.state.meta.isTouched &&
                        !!field.state.meta.errors.length
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={field.name}>
                            <div className="flex items-center gap-2 font-medium">
                              <TextAlignStart className="size-4 text-muted-foreground" />
                              Description
                            </div>
                          </FieldLabel>
                          <Textarea
                            id={field.name}
                            value={field.state.value || ""}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            placeholder="Add a detailed description..."
                            className="min-h-40 resize-y"
                            aria-invalid={isInvalid}
                          />
                          <FieldError errors={field.state.meta.errors} />
                        </Field>
                      )
                    }}
                  </form.Field>
                </FieldGroup>

                <TaskActivity taskId={task?.id} />
              </div>

              {/* Metadata Sidebar (40%) */}
              <div className="lg:col-span-2 lg:border-l lg:pl-4">
                <FieldGroup>
                  {/* Configuration / Meta Status Fields */}
                  <form.Field name="status_id">
                    {(field) => {
                      const isInvalid =
                        field.state.meta.isTouched &&
                        !!field.state.meta.errors.length
                      return (
                        <Field
                          data-invalid={isInvalid}
                          orientation="horizontal"
                          className="gap-4"
                        >
                          <FieldLabel
                            htmlFor={field.name}
                            className="w-28 flex-none!"
                          >
                            <div className="flex items-center gap-2">
                              <CircleDashed className="size-3.5 text-muted-foreground" />
                              Status
                            </div>
                          </FieldLabel>
                          {(() => {
                            const status = options.statuses.find(
                              (s) => s.id === field.state.value
                            )
                            return (
                              <TaskStatusBadge
                                name={status?.name || "Unknown"}
                                color={status?.color}
                                interactive
                                options={options.statuses}
                                value={field.state.value}
                                onValueChange={field.handleChange}
                                className="h-auto"
                              />
                            )
                          })()}
                          <FieldError errors={field.state.meta.errors} />
                        </Field>
                      )
                    }}
                  </form.Field>

                  <form.Field name="type_id">
                    {(field) => {
                      const isInvalid =
                        field.state.meta.isTouched &&
                        !!field.state.meta.errors.length
                      return (
                        <Field
                          data-invalid={isInvalid}
                          orientation="horizontal"
                          className="gap-4"
                        >
                          <FieldLabel
                            htmlFor={field.name}
                            className="w-28 flex-none!"
                          >
                            <div className="flex items-center gap-2">
                              <ListChecks className="size-3.5 text-muted-foreground" />
                              Type
                            </div>
                          </FieldLabel>
                          {(() => {
                            const type = options.types.find(
                              (t) => t.id === field.state.value
                            )
                            return (
                              <TaskTypeBadge
                                name={type?.name || "Unknown"}
                                color={type?.color}
                                interactive
                                options={options.types}
                                value={field.state.value}
                                onValueChange={field.handleChange}
                                className="h-auto"
                              />
                            )
                          })()}
                          <FieldError errors={field.state.meta.errors} />
                        </Field>
                      )
                    }}
                  </form.Field>

                  <form.Field name="priority_id">
                    {(field) => {
                      const isInvalid =
                        field.state.meta.isTouched &&
                        !!field.state.meta.errors.length
                      return (
                        <Field
                          data-invalid={isInvalid}
                          orientation="horizontal"
                          className="gap-4"
                        >
                          <FieldLabel
                            htmlFor={field.name}
                            className="w-28 flex-none!"
                          >
                            <div className="flex items-center gap-2">
                              <Flag className="size-3.5 text-muted-foreground" />
                              Priority
                            </div>
                          </FieldLabel>
                          {(() => {
                            const priority = options.priorities.find(
                              (p) => p.id === field.state.value
                            )
                            return (
                              <TaskPriorityBadge
                                name={priority?.name || "Unknown"}
                                color={priority?.color}
                                interactive
                                options={options.priorities}
                                value={field.state.value}
                                onValueChange={field.handleChange}
                                className="h-auto"
                              />
                            )
                          })()}
                          <FieldError errors={field.state.meta.errors} />
                        </Field>
                      )
                    }}
                  </form.Field>

                  {/* Planning Fields */}
                  <form.Field name="member_ids">
                    {(field) => {
                      const isInvalid =
                        field.state.meta.isTouched &&
                        !!field.state.meta.errors.length
                      return (
                        <Field
                          data-invalid={isInvalid}
                          orientation="horizontal"
                          className="gap-4"
                        >
                          <FieldLabel
                            htmlFor={field.name}
                            className="w-28 flex-none!"
                          >
                            <div className="flex items-center gap-2">
                              <Users className="size-3.5 text-muted-foreground" />
                              Team
                            </div>
                          </FieldLabel>
                          <MultiSelectCombobox
                            className="w-fit"
                            items={options.members}
                            value={options.members.filter((m) =>
                              field.state.value.includes(m.user_id)
                            )}
                            onValueChange={(vals) =>
                              field.handleChange(vals.map((v) => v.user_id))
                            }
                            itemToString={(m) => m.user?.name || ""}
                            itemToValue={(m) => m.user_id}
                            placeholder="Select members"
                            renderItem={(member) => (
                              <div className="flex items-center gap-2">
                                <Avatar className="size-5">
                                  <AvatarImage src={member.user?.avatar_url} />
                                  <AvatarFallback>
                                    {member.user?.name?.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{member.user?.name}</span>
                              </div>
                            )}
                          />
                          <FieldError errors={field.state.meta.errors} />
                        </Field>
                      )
                    }}
                  </form.Field>
                  <form.Field name="due_date">
                    {(field) => (
                      <Field orientation="horizontal" className="gap-4">
                        <FieldLabel
                          htmlFor={field.name}
                          className="w-28 flex-none!"
                        >
                          <div className="flex items-center gap-2">
                            <CalendarDays className="size-3.5 text-muted-foreground" />
                            Due Date
                          </div>
                        </FieldLabel>
                        <DateTimePicker
                          className="w-fit"
                          date={
                            field.state.value instanceof Date
                              ? field.state.value
                              : new Date()
                          }
                          onChange={field.handleChange}
                        />
                      </Field>
                    )}
                  </form.Field>

                  <form.Field name="estimated_hours">
                    {(field) => {
                      const isInvalid =
                        field.state.meta.isTouched &&
                        !!field.state.meta.errors.length
                      return (
                        <Field
                          data-invalid={isInvalid}
                          orientation="horizontal"
                          className="gap-4"
                        >
                          <FieldLabel
                            htmlFor={field.name}
                            className="w-28 flex-none!"
                          >
                            <div className="flex items-center gap-2">
                              <Clock className="size-3.5 text-muted-foreground" />
                              Est. Hours
                            </div>
                          </FieldLabel>
                          <Input
                            id={field.name}
                            type="number"
                            step="0.5"
                            min="0"
                            className="w-24"
                            value={field.state.value ?? ""}
                            onChange={(e) => {
                              const val = e.target.value
                              field.handleChange(
                                val === "" ? undefined : Number(val)
                              )
                            }}
                            aria-invalid={isInvalid}
                            placeholder="Hours"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            className="ml-auto"
                            onClick={handleAIEstimate}
                            disabled={estimate.isPending}
                          >
                            {estimate.isPending ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              <Sparkles className="size-4 text-primary" />
                            )}
                            AI Estimate
                          </Button>
                          <FieldError errors={field.state.meta.errors} />
                        </Field>
                      )
                    }}
                  </form.Field>

                  <TaskAIEstimationAlert aiExplanation={aiExplanation} />
                </FieldGroup>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
      {task && (
        <DeleteTaskListDialog
          task={task}
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          isPending={remove.isPending}
          onConfirm={handleConfirmDelete}
        />
      )}
    </>
  )
}
