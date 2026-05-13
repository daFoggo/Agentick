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
	TaskStatusCreateSchema,
	type TTaskStatusCreateInput,
} from "../../schemas";

interface ICreateTaskStatusDialogProps {
	projectId: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export const CreateTaskStatusDialog = ({
	projectId,
	open,
	onOpenChange,
}: ICreateTaskStatusDialogProps) => {
	const { createStatus } = useTaskConfigMutations();
	const {
		data: statusesData,
		isLoading: isStatusesLoading,
		isError: isStatusesError,
		error: statusesError,
	} = useQuery(
		taskConfigQueries.statuses(projectId, {
			page: 1,
			page_size: "all",
			ordering: "order",
		}),
	);

	const statuses = statusesData?.founds ?? [];
	const nextOrder = statuses.length;

	const form = useForm({
		defaultValues: {
			name: "",
			color: TAILWIND_500_COLORS.gray,
			order: nextOrder,
			is_default: false,
			is_completed: false,
		} as TTaskStatusCreateInput,
		validators: {
			onSubmit: TaskStatusCreateSchema,
		},
		onSubmit: async ({ value }) => {
			try {
				await createStatus.mutateAsync({
					projectId,
					payload: value,
				});
				toast.success("Task status created successfully");
				onOpenChange(false);
				form.reset();
			} catch (error) {
				toast.error(getErrorMessage(error, "Failed to create task status"));
				console.error(error);
			}
		},
	});

	useEffect(() => {
		if (!open || isStatusesLoading || isStatusesError) return;
		form.setFieldValue("order", nextOrder);
	}, [open, nextOrder, isStatusesLoading, isStatusesError, form]);

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
						<DialogTitle>Create new task status</DialogTitle>
						<DialogDescription>
							Add a new status to customize your task workflow.
						</DialogDescription>
					</DialogHeader>

					{isStatusesLoading && <Skeleton className="h-9 w-full" />}

					{isStatusesError && (
						<Alert variant="destructive">
							<AlertCircle className="size-4" />
							<AlertDescription>
								{getErrorMessage(
									statusesError,
									"Could not load task statuses.",
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
										<FieldLabel htmlFor={field.name}>Status Name</FieldLabel>
										<Input
											id={field.name}
											autoFocus
											name={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											placeholder="e.g. In Development"
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
											placeholder="0"
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
										Set as default status
									</FieldLabel>
								</div>
							)}
						/>

						<form.Field
							name="is_completed"
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
										Mark tasks as completed
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
							disabled={createStatus.isPending}
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
										createStatus.isPending ||
										isStatusesLoading ||
										isStatusesError
									}
								>
									{createStatus.isPending && (
										<Loader2 className="mr-2 size-4 animate-spin" />
									)}
									Create Status
								</Button>
							)}
						/>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};
