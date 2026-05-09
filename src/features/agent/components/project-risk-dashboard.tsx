import { useQuery } from "@tanstack/react-query";
import { Loader2, RefreshCw } from "lucide-react";
import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { agentQueries, useAgentMutations } from "../queries";
import { ProjectRiskGauge } from "./project-risk-gauge";
import { RiskDriversChart } from "./risk-drivers-chart";
import { RiskMatrixChart } from "./risk-matrix-chart";

interface IProjectRiskDashboardProps {
	projectId: string;
}

export const ProjectRiskDashboard = memo(
	({ projectId }: IProjectRiskDashboardProps) => {
		const { data: riskStats, isLoading } = useQuery(
			agentQueries.projectRiskStats(projectId),
		);

		const { analyzeProjectRisk } = useAgentMutations();

		const handleAnalyzeAll = () => {
			analyzeProjectRisk.mutate({ projectId });
		};

		if (isLoading) {
			return (
				<div className="space-y-4 col-span-full">
					<div className="flex items-center justify-between">
						<Skeleton className="h-8 w-36 rounded" />
					</div>
					<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
						<Skeleton className="col-span-1 h-[250px] rounded-xl" />
						<Skeleton className="col-span-1 md:col-span-2 h-[250px] rounded-xl" />
						<Skeleton className="col-span-1 h-[250px] rounded-xl" />
					</div>
				</div>
			);
		}

		if (!riskStats) return null;

		return (
			<div className="space-y-4 col-span-full">
				<div className="flex items-center justify-between">
					<Button
						onClick={handleAnalyzeAll}
						disabled={analyzeProjectRisk.isPending}
						size="sm"
						className="gap-2"
					>
						{analyzeProjectRisk.isPending ? (
							<Loader2 className="size-3.5 animate-spin" />
						) : (
							<RefreshCw className="size-3.5" />
						)}
						{analyzeProjectRisk.isPending
							? "Analyzing..."
							: "Analyze Project Risk"}
					</Button>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
					<ProjectRiskGauge overallRiskIndex={riskStats.overall_risk_index} />
					<RiskMatrixChart tasks={riskStats.tasks} />
					<RiskDriversChart tasks={riskStats.tasks} />
				</div>
			</div>
		);
	},
);

ProjectRiskDashboard.displayName = "ProjectRiskDashboard";
