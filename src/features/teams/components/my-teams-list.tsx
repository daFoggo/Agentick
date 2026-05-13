import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Plus, Users } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { Skeleton } from "@/components/ui/skeleton";
import { myTeamsQueryOptions } from "@/features/teams/queries";
import { getErrorMessage } from "@/lib/error";
import { CreateTeamDialog } from "./create-team-dialog";

export function MyTeamsList() {
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const {
		data: teamsData,
		isLoading,
		isError,
		error,
	} = useQuery(myTeamsQueryOptions());

	const teams = teamsData ?? [];

	const content = (() => {
		if (isLoading) {
			return (
				<div className="space-y-4">
					{[1, 2].map((i) => (
						<Skeleton key={i} className="h-16 w-full rounded-xl" />
					))}
				</div>
			);
		}

		if (isError) {
			return (
				<Alert variant="destructive">
					<AlertCircle className="size-4" />
					<AlertTitle>Error loading teams</AlertTitle>
					<AlertDescription>
						{getErrorMessage(error, "Could not load your teams.")}
					</AlertDescription>
				</Alert>
			);
		}

		if (teams.length === 0) {
			return (
				<Empty>
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<Users />
						</EmptyMedia>
						<EmptyTitle>No teams</EmptyTitle>
						<EmptyDescription>You haven't joined any teams.</EmptyDescription>
					</EmptyHeader>
					<EmptyContent>
						<Button
							type="button"
							variant="outline"
							onClick={() => setIsCreateOpen(true)}
						>
							<Plus className="size-4" />
							New Team
						</Button>
					</EmptyContent>
				</Empty>
			);
		}

		return (
			<div className="flex flex-col gap-2">
				{teams.map((team) => (
					<div
						key={team.id}
						className="flex cursor-pointer items-center gap-2 rounded-lg border bg-muted p-2 transition-colors hover:bg-muted/80"
					>
						<div className="relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted/50">
							{team.avatar_url && team.avatar_url !== "" ? (
								<img
									src={team.avatar_url}
									alt={team.name}
									className="h-full w-full object-cover"
								/>
							) : (
								<div className="text-xs font-medium text-muted-foreground uppercase">
									{team.name.slice(0, 2)}
								</div>
							)}
						</div>
						<div className="min-w-0 flex-1">
							<p className="truncate text-sm font-medium">{team.name}</p>
							<p className="truncate text-xs text-muted-foreground">
								{team.description || "Team collaboration space"}
							</p>
						</div>
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
						<Users className="size-4 text-muted-foreground" />
						<span>My Teams</span>
					</CardTitle>
					<Badge variant="secondary" className="font-mono">
						{teams.length}
					</Badge>
				</CardHeader>
				<CardContent className="max-h-72 overflow-y-auto">
					{content}
				</CardContent>
			</Card>
			<CreateTeamDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
		</>
	);
}
