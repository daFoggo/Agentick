import { useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import {
	Bookmark,
	BookmarkCheck,
	CheckCircle2,
	Circle,
	ClipboardList,
	FolderKanban,
	Trash2,
	Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardAction,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useInboxStore } from "@/stores/use-inbox-store";
import {
	deleteInboxFn,
	markInboxAsReadFn,
	toggleInboxBookmarkFn,
	unarchiveInboxFn,
} from "../functions";
import { inboxKeys } from "../queries";
import type { TInboxItem, TInboxType } from "../schemas";
import { InboxActionButton } from "./inbox-action-button";

const TYPE_CONFIG: Record<TInboxType, { label: string; className: string }> = {
	INVITATION: {
		label: "Invitation",
		className: "border-primary/20 bg-primary/10 text-primary",
	},
	TASK_ASSIGNED: {
		label: "Task",
		className:
			"border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400",
	},
	PROJECT_UPDATE: {
		label: "Project",
		className:
			"border-violet-500/20 bg-violet-500/10 text-violet-600 dark:text-violet-400",
	},
	SYSTEM: { label: "System", className: "" },
};

interface IInboxItemProps {
	item: TInboxItem;
	isSelected?: boolean;
}

export const InboxItem = ({ item, isSelected }: IInboxItemProps) => {
	const { setSelectedItemId } = useInboxStore();
	const queryClient = useQueryClient();

	const refreshInbox = () => {
		queryClient.invalidateQueries({ queryKey: inboxKeys.all });
	};

	// ACTIVE -> ARCHIVED
	const markAsReadMutation = useMutation({
		mutationFn: (id: string) =>
			markInboxAsReadFn({ data: { inboxItemId: id } }),
		onSuccess: () => {
			refreshInbox();
		},
	});

	// ARCHIVED -> ACTIVE (Mark as Unread)
	const markAsUnreadMutation = useMutation({
		mutationFn: (id: string) => unarchiveInboxFn({ data: { inboxItemId: id } }),
		onSuccess: () => {
			refreshInbox();
		},
	});

	// ARCHIVED/ACTIVE <-> BOOKMARKED
	const toggleBookmarkMutation = useMutation({
		mutationFn: (id: string) =>
			toggleInboxBookmarkFn({ data: { inboxItemId: id } }),
		onSuccess: () => {
			refreshInbox();
		},
	});

	const deleteMutation = useMutation({
		mutationFn: (id: string) => deleteInboxFn({ data: { inboxItemId: id } }),
		onSuccess: () => {
			refreshInbox();
		},
	});

	const handleToggleRead = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (item.status === "ACTIVE") {
			markAsReadMutation.mutate(item.id);
		} else {
			markAsUnreadMutation.mutate(item.id);
		}
	};

	const handleToggleBookmark = (e: React.MouseEvent) => {
		e.stopPropagation();
		toggleBookmarkMutation.mutate(item.id);
	};

	const handleDelete = (e: React.MouseEvent) => {
		e.stopPropagation();
		deleteMutation.mutate(item.id);
	};

	return (
		<TooltipProvider>
			<Card
				onClick={() => setSelectedItemId(item.id)}
				className={cn(
					"group relative cursor-pointer transition-all hover:bg-accent/50",
					item.status === "ACTIVE" && "bg-muted/40",
					isSelected && "ring-2 ring-primary ring-offset-0",
				)}
				size="sm"
			>
				<CardHeader className="pb-0">
					<CardTitle
						className={cn(
							"line-clamp-1 flex items-center gap-2",
							item.status === "ACTIVE"
								? "text-foreground"
								: "text-muted-foreground/80",
						)}
					>
						{item.status === "ACTIVE" && (
							<span className="size-2 shrink-0 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.4)]" />
						)}
						{item.title}
					</CardTitle>
					<CardDescription className="line-clamp-2 text-xs leading-relaxed">
						{item.content?.substring(0, 300)}
					</CardDescription>
					<CardAction className="opacity-0 transition-opacity group-hover:opacity-100">
						<div className="flex items-center gap-1">
							<InboxActionButton
								icon={item.status === "BOOKMARKED" ? BookmarkCheck : Bookmark}
								tooltip={
									item.status === "BOOKMARKED" ? "Remove bookmark" : "Bookmark"
								}
								onClick={handleToggleBookmark}
								className={cn(
									item.status === "BOOKMARKED" &&
										"text-yellow-500 hover:text-yellow-600",
								)}
							/>
							<InboxActionButton
								icon={item.status === "ACTIVE" ? CheckCircle2 : Circle}
								tooltip={
									item.status === "ACTIVE" ? "Mark as read" : "Mark as unread"
								}
								onClick={handleToggleRead}
								className={cn(
									item.status === "ARCHIVED" &&
										"text-orange-500 hover:text-orange-600",
								)}
							/>
							<InboxActionButton
								icon={Trash2}
								tooltip="Delete"
								onClick={handleDelete}
								className="hover:text-destructive"
							/>
						</div>
					</CardAction>
				</CardHeader>

				<CardFooter className="flex flex-col items-start gap-1.5 border-none bg-transparent">
					{/* Task metadata: project & team */}
					{item.type === "TASK_ASSIGNED" && item.data && (
						<div className="flex w-full flex-wrap items-center gap-1.5">
							{item.data.project_name && (
								<span className="flex items-center gap-1 text-xs text-muted-foreground">
									<FolderKanban className="size-3" />
									<span className="max-w-24 truncate font-medium">
										{item.data.project_name as string}
									</span>
								</span>
							)}
							{item.data.team_name && (
								<span className="flex items-center gap-1 text-xs text-muted-foreground">
									<span className="text-muted-foreground/40">·</span>
									<Users className="size-3" />
									<span className="max-w-24 truncate font-medium">
										{item.data.team_name as string}
									</span>
								</span>
							)}
						</div>
					)}
					<div className="flex w-full items-center justify-between">
						<Badge
							variant="outline"
							className={cn(
								"text-xs font-semibold",
								TYPE_CONFIG[item.type]?.className,
							)}
						>
							{item.type === "TASK_ASSIGNED" && (
								<ClipboardList className="mr-1 size-2.5" />
							)}
							{TYPE_CONFIG[item.type]?.label ?? item.type}
						</Badge>
						<span className="text-xs font-medium text-muted-foreground/60">
							{formatDistanceToNow(new Date(item.created_at), {
								addSuffix: true,
							})}
						</span>
					</div>
				</CardFooter>
			</Card>
		</TooltipProvider>
	);
};
