import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "@/components/ui/hover-card";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";

export const TimezoneViewer = () => {
	const [time, setTime] = useState<string | null>(null);

	useEffect(() => {
		const fmt = () =>
			new Date().toLocaleTimeString([], {
				hour: "2-digit",
				minute: "2-digit",
			});
		setTime(fmt());
		const id = setInterval(() => setTime(fmt()), 1000);
		return () => clearInterval(id);
	}, []);

	return (
		<SidebarMenuItem>
			<HoverCard openDelay={100} closeDelay={100}>
				<HoverCardTrigger>
					<SidebarMenuButton className="justify-between text-xs" size="sm">
						<span className="font-medium text-muted-foreground uppercase">
							time
						</span>
						<Badge variant="secondary" className="font-mono font-semibold">
							{time ?? "--:--"}
						</Badge>
					</SidebarMenuButton>
				</HoverCardTrigger>
				<HoverCardContent align="start">
					<p>
						Current project time in the project's timezone. All dates, ranges,
						and graphs you see are matched to this timezone.
					</p>
				</HoverCardContent>
			</HoverCard>
		</SidebarMenuItem>
	);
};
