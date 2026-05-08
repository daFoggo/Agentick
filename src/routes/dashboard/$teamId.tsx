import { createFileRoute, Outlet, useParams } from "@tanstack/react-router";
import { useEffect } from "react";
import { useDashboardStore } from "@/stores/use-dashboard-store";

export const Route = createFileRoute("/dashboard/$teamId")({
	component: DashboardTeamLayout,
});

function DashboardTeamLayout() {
	const { teamId } = useParams({ from: "/dashboard/$teamId" });
	const setLastTeamId = useDashboardStore((state) => state.setLastTeamId);

	useEffect(() => {
		if (teamId && teamId !== "personal") {
			setLastTeamId(teamId);
		}
	}, [teamId, setLastTeamId]);

	return <Outlet />;
}
