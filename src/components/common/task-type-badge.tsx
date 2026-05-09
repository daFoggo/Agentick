import { ChevronDown } from "lucide-react";
import type * as React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type TaskTypeBadgeVariant = "outline" | "solid" | "subtle";

export interface TaskTypeBadgeProps extends React.ComponentProps<typeof Badge> {
	name: string;
	color?: string;
	typeVariant?: TaskTypeBadgeVariant;
	interactive?: boolean;
}

/**
 * Reusable badge component for displaying Task Type.
 * Dynamically applies colors based on task type specifications with premium styling.
 * Supports "outline", "solid" (full-color background with foreground text), and "subtle" (tinted background) variants.
 */
export function TaskTypeBadge({
	name,
	color,
	className,
	typeVariant = "solid",
	interactive = false,
	...props
}: TaskTypeBadgeProps) {
	const isSolid = typeVariant === "solid";
	const isSubtle = typeVariant === "subtle";
	const isOutline = typeVariant === "outline";

	const badgeStyle: React.CSSProperties = {
		...props.style,
	};

	if (color) {
		if (isSolid) {
			badgeStyle.backgroundColor = color;
			badgeStyle.color = "var(--foreground)";
			badgeStyle.borderColor = "transparent";
		} else if (isSubtle) {
			badgeStyle.backgroundColor = `${color}15`; // ~10% opacity tinted background
			badgeStyle.color = color;
			badgeStyle.borderColor = "transparent";
		} else if (isOutline) {
			badgeStyle.borderColor = `${color}30`;
			badgeStyle.color = color;
			badgeStyle.backgroundColor = "transparent";
		}
	}

	return (
		<Badge
			data-slot="task-type-badge"
			variant="outline"
			className={cn(
				"inline-flex items-center gap-1.5 rounded-full font-medium transition-all duration-200",
				interactive && "cursor-pointer hover:bg-muted/50",
				className,
			)}
			style={badgeStyle}
			{...props}
		>
			<span className="max-w-24 truncate text-primary-foreground" title={name}>
				{name}
			</span>
			{interactive && (
				<ChevronDown className="size-3 shrink-0 opacity-50 text-primary-foreground" />
			)}
		</Badge>
	);
}
