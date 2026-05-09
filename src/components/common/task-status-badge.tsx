import { ChevronDown } from "lucide-react";
import type * as React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface TaskStatusBadgeProps
	extends React.ComponentProps<typeof Badge> {
	name: string;
	color?: string;
	interactive?: boolean;
}

/**
 * Reusable badge component for displaying Task Status.
 * Supports interactive indicators (e.g. dropdown trigger chevron) and hover styles.
 */
export function TaskStatusBadge({
	name,
	color,
	interactive = false,
	className,
	variant = "outline",
	...props
}: TaskStatusBadgeProps) {
	return (
		<Badge
			data-slot="task-status-badge"
			variant={variant}
			className={cn(
				"gap-1.5 font-medium transition-colors duration-300 ease-in-out",
				interactive && "cursor-pointer hover:bg-muted/50",
				className,
			)}
			style={{
				borderColor: color && variant === "outline" ? color : undefined,
				color: color && variant === "outline" ? color : undefined,
				backgroundColor: color && variant === "default" ? color : undefined,
				...props.style,
			}}
			{...props}
		>
			<span
				className="size-1.5 shrink-0 rounded-full"
				style={{ backgroundColor: color || "currentColor" }}
			/>
			<span className="truncate">{name}</span>
			{interactive && <ChevronDown className="size-3 shrink-0 opacity-50" />}
		</Badge>
	);
}
