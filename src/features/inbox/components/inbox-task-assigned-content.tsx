import { useNavigate } from "@tanstack/react-router";
import { ClipboardList, ExternalLink, FolderKanban, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { TInboxItem } from "../schemas";

interface IInboxTaskAssignedContentProps {
	item: TInboxItem;
}

export const InboxTaskAssignedContent = ({
	item,
}: IInboxTaskAssignedContentProps) => {
	const navigate = useNavigate();
	const data = item.data ?? {};

	const taskTitle = data.task_title as string | undefined;
	const projectName = data.project_name as string | undefined;
	const teamName = data.team_name as string | undefined;
	const projectId = data.project_id as string | undefined;
	const teamId = data.team_id as string | undefined;

	const handleViewInBoard = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (teamId && projectId) {
			navigate({
				to: "/dashboard/$teamId/projects/$projectId/board",
				params: { teamId, projectId },
			});
		}
	};

	return (
		<Card
			className="overflow-hidden border-blue-500/20 bg-blue-500/5 shadow-none"
			size="sm"
		>
			{/* Header with task icon */}
			<CardHeader className="pb-3">
				<div className="flex items-start gap-3">
					<div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400">
						<ClipboardList className="size-4" />
					</div>
					<div className="min-w-0 flex-1">
						<p className="text-xs font-semibold uppercase tracking-wide text-blue-600/70 dark:text-blue-400/70">
							Task Assignment
						</p>
						<CardTitle className="mt-0.5 line-clamp-2 text-sm font-semibold leading-snug text-foreground">
							{taskTitle ?? item.title}
						</CardTitle>
					</div>
				</div>
			</CardHeader>

			<Separator className="bg-blue-500/10" />

			{/* Metadata rows */}
			<CardContent className="space-y-2.5 pt-3 pb-3">
				{/* Project */}
				{projectName && (
					<div className="flex items-center gap-2.5 text-sm">
						<FolderKanban className="size-3.5 shrink-0 text-muted-foreground" />
						<span className="text-xs text-muted-foreground">Project</span>
						<Badge
							variant="outline"
							className="ml-auto max-w-40 truncate border-blue-500/20 bg-blue-500/5 px-2 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-400"
						>
							{projectName}
						</Badge>
					</div>
				)}

				{/* Team */}
				{teamName && (
					<div className="flex items-center gap-2.5 text-sm">
						<Users className="size-3.5 shrink-0 text-muted-foreground" />
						<span className="text-xs text-muted-foreground">Team</span>
						<Badge
							variant="secondary"
							className="ml-auto max-w-40 truncate px-2 py-0.5 text-xs font-medium"
						>
							{teamName}
						</Badge>
					</div>
				)}
			</CardContent>

			{/* CTA */}
			{teamId && projectId && (
				<>
					<Separator className="bg-blue-500/10" />
					<CardFooter className="pt-3">
						<Button
							variant="outline"
							size="sm"
							className="w-full gap-2 border-blue-500/20 bg-transparent text-sm font-medium text-blue-600 hover:bg-blue-500 hover:text-white dark:text-blue-400 dark:hover:text-white transition-all duration-200"
							onClick={handleViewInBoard}
						>
							<ExternalLink className="size-3.5" />
							View in Board
						</Button>
					</CardFooter>
				</>
			)}
		</Card>
	);
};
