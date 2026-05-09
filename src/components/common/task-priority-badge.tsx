import { ChevronDown } from "lucide-react";
import type * as React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface TaskPriorityBadgeProps
	extends React.ComponentProps<typeof Badge> {
	name: string;
	color?: string;
	interactive?: boolean;
}

/**
 * Reusable badge component for displaying Task Priority.
 * Features customizable variants, colors, and an interactive state indicator.
 */
export function TaskPriorityBadge({
	name,
	color,
	interactive = false,
	className,
	variant = "secondary",
	...props
}: TaskPriorityBadgeProps) {
	return (
		<Badge
			data-slot="task-priority-badge"
			variant={variant}
			className={cn(
				"gap-1.5 px-2 font-medium transition-colors duration-300 ease-in-out",
				interactive && "cursor-pointer hover:bg-muted",
				className,
			)}
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
