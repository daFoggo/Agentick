import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	Bookmark,
	BookmarkCheck,
	CheckCircle2,
	Clock,
	Inbox,
	RotateCcw,
	Trash2,
} from "lucide-react";
import { CardDescription } from "@/components/ui/card";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
	deleteInboxFn,
	markInboxAsReadFn,
	toggleInboxBookmarkFn,
	unarchiveInboxFn,
} from "../functions";
import { inboxKeys } from "../queries";
import type { TInboxItem } from "../schemas";
import { InboxActionButton } from "./inbox-action-button";
import { InboxContent } from "./inbox-content";

interface IInboxDetailPanelProps {
	item: TInboxItem | null;
}

export const InboxDetailPanel = ({ item }: IInboxDetailPanelProps) => {
	const queryClient = useQueryClient();

	const refreshInbox = () => {
		queryClient.invalidateQueries({ queryKey: inboxKeys.all });
	};

	const markAsReadMutation = useMutation({
		mutationFn: (id: string) =>
			markInboxAsReadFn({ data: { inboxItemId: id } }),
		onSuccess: () => {
			refreshInbox();
		},
	});

	const markAsUnreadMutation = useMutation({
		mutationFn: (id: string) => unarchiveInboxFn({ data: { inboxItemId: id } }),
		onSuccess: () => {
			refreshInbox();
		},
	});

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
		if (item?.id) {
			if (item.status === "ACTIVE") {
				markAsReadMutation.mutate(item.id);
			} else {
				markAsUnreadMutation.mutate(item.id);
			}
		}
	};

	const handleToggleBookmark = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (item?.id) {
			toggleBookmarkMutation.mutate(item.id);
		}
	};

	const handleDelete = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (item?.id) {
			deleteMutation.mutate(item.id);
		}
	};

	if (!item) {
		return (
			<div className="flex h-full items-center justify-center">
				<Empty className="border-none bg-transparent">
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<Inbox />
						</EmptyMedia>
						<EmptyTitle>No item selected</EmptyTitle>
						<EmptyDescription>
							Select an inbox item to view details
						</EmptyDescription>
					</EmptyHeader>
				</Empty>
			</div>
		);
	}

	return (
		<div className="flex h-full flex-col overflow-hidden bg-card">
			<TooltipProvider>
				<div className="flex shrink-0 items-start justify-between border-b p-4">
					<div className="flex-1 space-y-2">
						<span className="flex items-center gap-1 text-xs text-muted-foreground">
							<Clock className="size-3" />
							{new Date(item.created_at).toLocaleString()}
						</span>
						<div className="text-xl font-bold">{item.title}</div>
						{/* Show project & team context for task notifications */}
						{item.type === "TASK_ASSIGNED" && item.data && (
							<div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-0.5">
								{(item.data.project_name as string | undefined) && (
									<CardDescription className="flex items-center gap-1 text-xs">
										<span className="font-medium text-foreground/70">
											Project:
										</span>
										<span>{item.data.project_name as string}</span>
									</CardDescription>
								)}
								{(item.data.team_name as string | undefined) && (
									<CardDescription className="flex items-center gap-1 text-xs">
										<span className="font-medium text-foreground/70">
											Team:
										</span>
										<span>{item.data.team_name as string}</span>
									</CardDescription>
								)}
							</div>
						)}
					</div>
					<div className="ml-4 flex items-center gap-1">
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
							icon={item.status === "ACTIVE" ? CheckCircle2 : RotateCcw}
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
				</div>

				{/* Content */}
				<div className="flex-1 overflow-y-auto p-4">
					<div className="space-y-4">
						<CardDescription className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap leading-relaxed text-muted-foreground">
							{item.content}
						</CardDescription>
						<InboxContent item={item} />
					</div>
				</div>
			</TooltipProvider>
		</div>
	);
};
