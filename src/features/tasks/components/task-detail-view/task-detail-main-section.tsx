import type { AnyFieldApi } from "@tanstack/react-form";
import { TextAlignStart } from "lucide-react";
import { MarkdownEditor } from "@/components/common/markdown-editor";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import type { ITaskListDialogOptions, TTask } from "@/features/tasks";
import type { TTaskDetailFormApi } from "@/features/tasks/schemas";
import { TaskActivity } from "./task-activity";
import { TaskSubTasksSection } from "./task-sub-tasks-section";

interface ITaskDetailMainSectionProps {
	form: TTaskDetailFormApi;
	task?: TTask;
	taskId?: string;
	options: ITaskListDialogOptions;
	parentTaskOptions?: TTask[];
	isLoading?: boolean;
}

export const TaskDetailMainSection = ({
	form,
	task,
	taskId,
	options,
	parentTaskOptions = [],
	isLoading,
}: ITaskDetailMainSectionProps) => {
	return (
		<div className="space-y-6 lg:col-span-3">
			<FieldGroup>
				<form.Field name="description">
					{(field: AnyFieldApi) => {
						const isInvalid =
							field.state.meta.isTouched && !!field.state.meta.errors.length;

						return (
							<Field data-invalid={isInvalid}>
								<FieldLabel htmlFor={field.name}>
									<div className="flex items-center gap-2 font-medium">
										<TextAlignStart className="size-4 text-muted-foreground" />
										Description
									</div>
								</FieldLabel>
								<MarkdownEditor
									id={field.name}
									value={field.state.value || ""}
									onBlur={field.handleBlur}
									onChange={(value) => field.handleChange(value)}
									placeholder="Add a detailed description..."
									contentClassName="max-h-60 overflow-y-auto"
									editorClassName="min-h-40"
									aria-invalid={isInvalid}
								/>
								<FieldError errors={field.state.meta.errors} />
							</Field>
						);
					}}
				</form.Field>
			</FieldGroup>

			<TaskSubTasksSection
				task={task}
				options={options}
				parentTaskOptions={parentTaskOptions}
				isLoading={isLoading}
			/>

			{taskId && <TaskActivity taskId={taskId} />}
		</div>
	);
};
