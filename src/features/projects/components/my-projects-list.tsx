import { useSuspenseQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import { Briefcase, FolderGit2, Plus } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { myProjectsQueryOptions } from "@/features/projects/queries";
import { CreateProjectDialog } from "./create-project-dialog";

export function MyProjectsList() {
	const navigate = useNavigate();
	const { teamId } = useParams({ strict: false });
	const [isCreateOpen, setIsCreateOpen] = useState(false);

	const { data: projects = [] } = useSuspenseQuery(
		myProjectsQueryOptions(teamId),
	);

	const content = (() => {
		if (projects.length === 0) {
			return (
				<Empty>
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<Briefcase />
						</EmptyMedia>
						<EmptyTitle>No projects</EmptyTitle>
						<EmptyDescription>
							You haven't joined any projects yet.
						</EmptyDescription>
					</EmptyHeader>
					<EmptyContent>
						<Button
							type="button"
							variant="outline"
							onClick={() => setIsCreateOpen(true)}
						>
							<Plus className="size-4" />
							New Project
						</Button>
					</EmptyContent>
				</Empty>
			);
		}

		return (
			<div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{projects.map((project) => (
					<div
						key={project.id}
						role="button"
						tabIndex={0}
						className="flex cursor-pointer flex-col gap-2 rounded-lg border bg-muted p-2 transition-colors hover:bg-muted/80"
						onClick={() =>
							navigate({
								to: "/dashboard/$teamId/projects/$projectId/list",
								params: {
									teamId: teamId || "personal",
									projectId: project.id,
								},
							})
						}
					>
						<div className="flex items-center justify-between">
							<span className="truncate text-sm font-medium">
								{project.name}
							</span>
						</div>
						<p className="line-clamp-1 text-xs text-muted-foreground">
							{project.description || "Building amazing things."}
						</p>
					</div>
				))}
			</div>
		);
	})();

	return (
		<>
			<Card>
				<CardHeader className="flex flex-row items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<FolderGit2 className="size-4 text-muted-foreground" />
						<span>My Projects</span>
					</CardTitle>
					<Badge variant="secondary" className="font-mono">
						{projects.length}
					</Badge>
				</CardHeader>

				<CardContent>{content}</CardContent>
			</Card>
			<CreateProjectDialog
				open={isCreateOpen}
				onOpenChange={setIsCreateOpen}
				teamId={teamId || "personal"}
			/>
		</>
	);
}
