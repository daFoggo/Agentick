import type { AnyFieldApi } from "@tanstack/react-form";
import {
	CalendarDays,
	CircleDashed,
	Clock,
	Flag,
	ListChecks,
	Sparkles,
	Users,
} from "lucide-react";

import { DateTimePicker } from "@/components/common/date-picker";
import { MultiSelectCombobox } from "@/components/common/multi-select-combobox";
import { TaskPriorityBadge } from "@/components/common/task-priority-badge";
import { TaskStatusBadge } from "@/components/common/task-status-badge";
import { TaskTypeBadge } from "@/components/common/task-type-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type {
	ITaskListDialogOptions,
	TTaskAIEstimationExplanation,
	TTaskDetailFormApi,
} from "@/features/tasks/schemas";
import { TaskAIEstimationAlert } from "../task-table/task-ai-estimation-alert";

interface TaskDetailSidebarSectionProps {
	form: TTaskDetailFormApi;
	options: ITaskListDialogOptions;
	aiExplanation: TTaskAIEstimationExplanation | null;
	isEstimating: boolean;
	onAIEstimate: () => void;
}

const getOptionById = <T extends { id: string; name: string; color?: string }>(
	items: T[],
	id: string,
) => items.find((item) => item.id === id);

export const TaskDetailSidebarSection = ({
	form,
	options,
	aiExplanation,
	isEstimating,
	onAIEstimate,
}: TaskDetailSidebarSectionProps) => {
	return (
		<div className="lg:col-span-2 lg:border-l lg:pl-4">
			<FieldGroup>
				<form.Field name="status_id">
					{(field: AnyFieldApi) => {
						const isInvalid =
							field.state.meta.isTouched && !!field.state.meta.errors.length;
						const status = getOptionById(options.statuses, field.state.value);

						return (
							<Field
								data-invalid={isInvalid}
								orientation="horizontal"
								className="gap-4"
							>
								<FieldLabel htmlFor={field.name} className="w-28 flex-none!">
									<div className="flex items-center gap-2">
										<CircleDashed className="size-3.5 text-muted-foreground" />
										Status
									</div>
								</FieldLabel>
								<TaskStatusBadge
									name={status?.name || "Unknown"}
									color={status?.color}
									interactive
									options={options.statuses}
									value={field.state.value}
									onValueChange={field.handleChange}
									className="h-auto"
								/>
								<FieldError errors={field.state.meta.errors} />
							</Field>
						);
					}}
				</form.Field>

				<form.Field name="type_id">
					{(field: AnyFieldApi) => {
						const isInvalid =
							field.state.meta.isTouched && !!field.state.meta.errors.length;
						const type = getOptionById(options.types, field.state.value);

						return (
							<Field
								data-invalid={isInvalid}
								orientation="horizontal"
								className="gap-4"
							>
								<FieldLabel htmlFor={field.name} className="w-28 flex-none!">
									<div className="flex items-center gap-2">
										<ListChecks className="size-3.5 text-muted-foreground" />
										Type
									</div>
								</FieldLabel>
								<TaskTypeBadge
									name={type?.name || "Unknown"}
									color={type?.color}
									interactive
									options={options.types}
									value={field.state.value}
									onValueChange={field.handleChange}
									className="h-auto"
								/>
								<FieldError errors={field.state.meta.errors} />
							</Field>
						);
					}}
				</form.Field>

				<form.Field name="priority_id">
					{(field: AnyFieldApi) => {
						const isInvalid =
							field.state.meta.isTouched && !!field.state.meta.errors.length;
						const priority = getOptionById(
							options.priorities,
							field.state.value,
						);

						return (
							<Field
								data-invalid={isInvalid}
								orientation="horizontal"
								className="gap-4"
							>
								<FieldLabel htmlFor={field.name} className="w-28 flex-none!">
									<div className="flex items-center gap-2">
										<Flag className="size-3.5 text-muted-foreground" />
										Priority
									</div>
								</FieldLabel>
								<TaskPriorityBadge
									name={priority?.name || "Unknown"}
									color={priority?.color}
									interactive
									options={options.priorities}
									value={field.state.value}
									onValueChange={field.handleChange}
									className="h-auto"
								/>
								<FieldError errors={field.state.meta.errors} />
							</Field>
						);
					}}
				</form.Field>

				<form.Field name="member_ids">
					{(field: AnyFieldApi) => {
						const isInvalid =
							field.state.meta.isTouched && !!field.state.meta.errors.length;

						return (
							<Field
								data-invalid={isInvalid}
								orientation="horizontal"
								className="gap-4"
							>
								<FieldLabel htmlFor={field.name} className="w-28 flex-none!">
									<div className="flex items-center gap-2">
										<Users className="size-3.5 text-muted-foreground" />
										Team
									</div>
								</FieldLabel>
								<MultiSelectCombobox
									className="w-fit"
									items={options.members}
									value={options.members.filter((item: any) =>
										field.state.value.includes(item.user_id),
									)}
									onValueChange={(values) =>
										field.handleChange(values.map((item: any) => item.user_id))
									}
									itemToString={(item: any) => item.user?.name || ""}
									itemToValue={(item: any) => item.user_id}
									placeholder="Select members"
									renderItem={(member: any) => (
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
						);
					}}
				</form.Field>

				<form.Field name="due_date">
					{(field: AnyFieldApi) => (
						<Field orientation="horizontal" className="gap-4">
							<FieldLabel htmlFor={field.name} className="w-28 flex-none!">
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
					{(field: AnyFieldApi) => {
						const isInvalid =
							field.state.meta.isTouched && !!field.state.meta.errors.length;

						return (
							<Field
								data-invalid={isInvalid}
								orientation="horizontal"
								className="gap-4"
							>
								<FieldLabel htmlFor={field.name} className="w-28 flex-none!">
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
										const val = e.target.value;
										field.handleChange(val === "" ? undefined : Number(val));
									}}
									aria-invalid={isInvalid}
									placeholder="Hours"
								/>
								<Button
									type="button"
									variant="outline"
									className="ml-auto"
									onClick={onAIEstimate}
									disabled={isEstimating}
								>
									{isEstimating ? (
										<Sparkles className="size-4 animate-spin" />
									) : (
										<Sparkles className="size-4 text-primary" />
									)}
									AI Estimate
								</Button>
								<FieldError errors={field.state.meta.errors} />
							</Field>
						);
					}}
				</form.Field>

				<TaskAIEstimationAlert aiExplanation={aiExplanation} />
			</FieldGroup>
		</div>
	);
};
