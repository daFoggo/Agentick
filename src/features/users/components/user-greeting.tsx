import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { PackageCheck, SlidersHorizontal, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	ButtonGroup,
	ButtonGroupSeparator,
	ButtonGroupText,
} from "@/components/ui/button-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { getUserGreeting } from "../helpers";
import { userQueries } from "../queries";
import type { TStatsPeriod } from "../schemas";

export const UserGreeting = () => {
	const { data: user } = useSuspenseQuery(userQueries.me());
	const greeting = useMemo(() => getUserGreeting(user.name), [user.name]);

	const [period, setPeriod] = useState<TStatsPeriod>("weekly");
	const { data: stats } = useQuery(userQueries.stats(period));

	return (
		<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
			<p className="text-xl font-light">{greeting}</p>

			<div className="flex items-center gap-2">
				<ButtonGroup className="rounded-full border-none bg-muted/40">
					<Select
						value={period}
						onValueChange={(val) => setPeriod(val as TStatsPeriod)}
					>
						<SelectTrigger className="rounded-full border-none bg-transparent">
							<SelectValue placeholder="My weekly stats" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="weekly">My weekly stats</SelectItem>
							<SelectItem value="monthly">My monthly stats</SelectItem>
						</SelectContent>
					</Select>

					<ButtonGroupSeparator />

					<ButtonGroupText className="cursor-default gap-2 border-none bg-transparent">
						<PackageCheck className="size-3.5 text-muted-foreground" />
						<div className="flex items-center gap-1">
							<span className="font-semibold text-foreground">
								{stats?.tasks_completed ?? "—"}
							</span>
							<span className="text-sm text-muted-foreground">
								tasks completed
							</span>
						</div>
					</ButtonGroupText>

					<ButtonGroupText className="cursor-default gap-2 border-none bg-transparent">
						<Users className="size-3.5 text-muted-foreground" />
						<div className="flex items-center gap-1">
							<span className="font-semibold text-foreground">
								{stats?.collaborated_with ?? "—"}
							</span>
							<span className="text-sm text-muted-foreground">
								collaborated with
							</span>
						</div>
					</ButtonGroupText>
				</ButtonGroup>

				<Button variant="outline">
					<SlidersHorizontal />
					Customize
				</Button>
			</div>
		</div>
	);
};
