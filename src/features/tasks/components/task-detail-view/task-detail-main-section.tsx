import type { AnyFieldApi } from "@tanstack/react-form";
import { TextAlignStart } from "lucide-react";

import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import type { ITaskListDialogOptions, TTask } from "@/features/tasks";
import type { TTaskDetailFormApi } from "@/features/tasks/schemas";
import { TaskActivity } from "./task-activity";
import { TaskSubTasksSection } from "./task-sub-tasks-section";

interface ITaskDetailMainSectionProps {
	form: TTaskDetailFormApi;
	task?: TTask;
	taskId?: string;
	options: ITaskListDialogOptions;
}

export const TaskDetailMainSection = ({
	form,
	task,
	taskId,
	options,
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
								<Textarea
									id={field.name}
									value={field.state.value || ""}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="Add a detailed description..."
									className="min-h-40 resize-none"
									aria-invalid={isInvalid}
								/>
								<FieldError errors={field.state.meta.errors} />
							</Field>
						);
					}}
				</form.Field>
			</FieldGroup>

			<TaskSubTasksSection task={task} options={options} />

			<TaskActivity taskId={taskId} />
		</div>
	);
};
