import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
	TAILWIND_500_COLORS,
	TAILWIND_COLOR_OPTIONS,
} from "@/constants/color-options";
import { getErrorMessage } from "@/lib/error";
import { taskConfigQueries, useTaskConfigMutations } from "../../queries";
import {
	TaskPriorityCreateSchema,
	type TTaskPriorityCreateInput,
} from "../../schemas";

interface ICreateTaskPriorityDialogProps {
	projectId: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export const CreateTaskPriorityDialog = ({
	projectId,
	open,
	onOpenChange,
}: ICreateTaskPriorityDialogProps) => {
	const { createPriority } = useTaskConfigMutations();
	const {
		data: prioritiesData,
		isLoading: isPrioritiesLoading,
		isError: isPrioritiesError,
		error: prioritiesError,
	} = useQuery(
		taskConfigQueries.priorities(projectId, {
			page: 1,
			page_size: "all",
			ordering: "order",
		}),
	);

	const nextOrder = prioritiesData?.founds.length ?? 0;
	const form = useForm({
		defaultValues: {
			name: "",
			color: TAILWIND_500_COLORS.gray,
			level: 0,
			order: nextOrder,
			is_default: false,
		} as TTaskPriorityCreateInput,
		validators: { onSubmit: TaskPriorityCreateSchema },
		onSubmit: async ({ value }) => {
			try {
				await createPriority.mutateAsync({ projectId, payload: value });
				toast.success("Task priority created successfully");
				onOpenChange(false);
				form.reset();
			} catch (error) {
				toast.error(getErrorMessage(error, "Failed to create task priority"));
				console.error(error);
			}
		},
	});

	useEffect(() => {
		if (!open || isPrioritiesLoading || isPrioritiesError) return;
		form.setFieldValue("order", nextOrder);
	}, [open, nextOrder, isPrioritiesLoading, isPrioritiesError, form]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:min-w-xl">
				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
					className="flex flex-col gap-4"
				>
					<DialogHeader>
						<DialogTitle>Create new task priority</DialogTitle>
						<DialogDescription>
							Add a new priority for task triage.
						</DialogDescription>
					</DialogHeader>

					{isPrioritiesLoading && <Skeleton className="h-9 w-full" />}

					{isPrioritiesError && (
						<Alert variant="destructive">
							<AlertCircle className="size-4" />
							<AlertDescription>
								{getErrorMessage(
									prioritiesError,
									"Could not load task priorities.",
								)}
							</AlertDescription>
						</Alert>
					)}

					<FieldGroup>
						<form.Field
							name="name"
							children={(field) => {
								const isInvalid =
									field.state.meta.isTouched &&
									!!field.state.meta.errors.length;
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel htmlFor={field.name}>Priority Name</FieldLabel>
										<Input
											id={field.name}
											autoFocus
											name={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											placeholder="e.g. High"
											aria-invalid={isInvalid}
										/>
										<FieldError errors={field.state.meta.errors} />
									</Field>
								);
							}}
						/>
						<form.Field
							name="level"
							children={(field) => {
								const isInvalid =
									field.state.meta.isTouched &&
									!!field.state.meta.errors.length;
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel htmlFor={field.name}>Level</FieldLabel>
										<Input
											id={field.name}
											name={field.name}
											type="number"
											min={0}
											max={3}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) =>
												field.handleChange(parseInt(e.target.value, 10))
											}
											aria-invalid={isInvalid}
										/>
										<FieldError errors={field.state.meta.errors} />
									</Field>
								);
							}}
						/>
						<form.Field
							name="color"
							children={(field) => {
								const isInvalid =
									field.state.meta.isTouched &&
									!!field.state.meta.errors.length;
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel htmlFor={field.name}>Color</FieldLabel>
										<Select
											value={field.state.value}
											onValueChange={field.handleChange}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												{TAILWIND_COLOR_OPTIONS.map((option) => (
													<SelectItem key={option.value} value={option.value}>
														<div className="flex items-center gap-2">
															<div
																className="size-4 rounded-full"
																style={{ backgroundColor: option.value }}
															/>
															{option.label}
														</div>
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FieldError errors={field.state.meta.errors} />
									</Field>
								);
							}}
						/>
						<form.Field
							name="order"
							children={(field) => {
								const isInvalid =
									field.state.meta.isTouched &&
									!!field.state.meta.errors.length;
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel htmlFor={field.name}>Order</FieldLabel>
										<Input
											id={field.name}
											name={field.name}
											type="number"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) =>
												field.handleChange(parseInt(e.target.value, 10))
											}
											aria-invalid={isInvalid}
										/>
										<FieldError errors={field.state.meta.errors} />
									</Field>
								);
							}}
						/>
						<form.Field
							name="is_default"
							children={(field) => (
								<div className="flex items-center gap-2">
									<Checkbox
										id={field.name}
										checked={field.state.value}
										onCheckedChange={(checked) =>
											field.handleChange(checked as boolean)
										}
									/>
									<FieldLabel htmlFor={field.name} className="mb-0">
										Set as default priority
									</FieldLabel>
								</div>
							)}
						/>
					</FieldGroup>
					<DialogFooter>
						<Button
							type="button"
							variant="ghost"
							onClick={() => onOpenChange(false)}
							disabled={createPriority.isPending}
						>
							Cancel
						</Button>
						<form.Subscribe
							selector={(state) => [state.canSubmit, state.isSubmitting]}
							children={([canSubmit]) => (
								<Button
									type="submit"
									disabled={
										!canSubmit ||
										createPriority.isPending ||
										isPrioritiesLoading ||
										isPrioritiesError
									}
								>
									{createPriority.isPending && (
										<Loader2 className="mr-2 size-4 animate-spin" />
									)}
									Create Priority
								</Button>
							)}
						/>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};
