import { useQuery } from "@tanstack/react-query";
import { Activity, Loader2, RefreshCw } from "lucide-react";
import {
	CartesianGrid,
	Cell,
	PolarAngleAxis,
	PolarGrid,
	Radar,
	RadarChart,
	RadialBar,
	RadialBarChart,
	Scatter,
	ScatterChart,
	XAxis,
	YAxis,
	ZAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { agentQueries, useAgentMutations } from "../queries";
import type { TRiskStatsTask } from "../schemas";

interface ProjectRiskDashboardProps {
	projectId: string;
}

const gaugeConfig = {
	riskIndex: {
		label: "Risk Index",
	},
} satisfies ChartConfig;

const scatterConfig = {
	critical: { label: "Critical", color: "var(--destructive)" },
	high: { label: "High", color: "var(--chart-4)" },
	medium: { label: "Warning", color: "var(--chart-3)" },
	low: { label: "Safe", color: "var(--chart-2)" },
} satisfies ChartConfig;

const radarConfig = {
	value: {
		label: "Risk Factor",
		color: "var(--destructive)",
	},
} satisfies ChartConfig;

export const ProjectRiskDashboard = ({
	projectId,
}: ProjectRiskDashboardProps) => {
	const { data: riskStats, isLoading } = useQuery(
		agentQueries.projectRiskStats(projectId),
	);

	const { analyzeProjectRisk } = useAgentMutations();

	const handleAnalyzeAll = () => {
		analyzeProjectRisk.mutate({ projectId });
	};

	if (isLoading) {
		return (
			<div className="flex h-64 items-center justify-center rounded-xl border border-dashed">
				<div className="flex flex-col items-center gap-2 text-muted-foreground">
					<Activity className="size-6 animate-spin text-primary" />
					<p className="text-sm">Loading AI risk stats...</p>
				</div>
			</div>
		);
	}

	if (!riskStats) return null;

	// 1. Dữ liệu cho Radial Bar Chart (Overall Risk Index)
	const overallRiskPct = Math.round(riskStats.overall_risk_index * 100);
	let gaugeColor = "var(--chart-2)"; // Default to safe/low
	let gaugeLabel = "Safe";
	if (overallRiskPct >= 70) {
		gaugeColor = "var(--destructive)";
		gaugeLabel = "Critical";
	} else if (overallRiskPct >= 40) {
		gaugeColor = "var(--chart-3)";
		gaugeLabel = "Attention Needed";
	}

	const gaugeData = [
		{ name: "riskIndex", value: overallRiskPct, fill: gaugeColor },
	];

	// 2. Dữ liệu cho Scatter Plot (Ma trận Rủi ro)
	const scatterData = riskStats.tasks.map((t) => ({
		...t,
		x: t.days_remaining,
		y: t.risk_score * 100,
		z: t.estimated_hours || 1,
	}));

	const getBubbleColor = (risk_level: string) => {
		switch (risk_level) {
			case "critical":
				return scatterConfig.critical.color;
			case "high":
				return scatterConfig.high.color;
			case "medium":
				return scatterConfig.medium.color;
			default:
				return scatterConfig.low.color;
		}
	};

	// 3. Dữ liệu cho Radar Chart (Trung bình các tín hiệu rủi ro)
	let totalTimeVar = 0,
		totalSched = 0,
		totalCongest = 0,
		totalBlocked = 0;
	const numTasks = riskStats.tasks.length || 1;

	riskStats.tasks.forEach((t) => {
		if (t.signals) {
			if (t.signals.is_over_estimate) totalTimeVar += 100;
			if (t.signals.has_schedule_bottleneck) totalSched += 100;
			if (t.signals.parallel_tasks_count && t.signals.parallel_tasks_count > 3)
				totalCongest += 100;
			if (t.signals.is_blocked) totalBlocked += 100;
		}
	});

	const radarData = [
		{ subject: "Time Overrun", value: totalTimeVar / numTasks },
		{ subject: "Bottleneck", value: totalSched / numTasks },
		{ subject: "Congestion", value: totalCongest / numTasks },
		{ subject: "Blocked", value: totalBlocked / numTasks },
		{
			subject: "Critical Deadline",
			value:
				(riskStats.tasks.filter(
					(t) => t.days_remaining <= 2 && t.days_remaining >= 0,
				).length /
					numTasks) *
				100,
		},
	];

	return (
		<div className="space-y-4 col-span-full">
			<div className="flex items-center justify-between mb-2">
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
				{/* Widget 1: Project Risk Gauge */}
				<div className="col-span-1 rounded-xl border bg-card p-5 shadow-sm relative overflow-hidden">
					<h3 className="text-sm font-semibold mb-4 text-muted-foreground text-center">
						Project Risk Index
					</h3>
					<div className="relative flex items-center justify-center h-[180px]">
						<ChartContainer config={gaugeConfig} className="w-full h-full">
							<RadialBarChart
								cx="50%"
								cy="100%"
								innerRadius="80%"
								outerRadius="100%"
								barSize={16}
								data={gaugeData}
								startAngle={180}
								endAngle={0}
							>
								<RadialBar background dataKey="value" cornerRadius={10} />
							</RadialBarChart>
						</ChartContainer>
						<div className="absolute bottom-0 text-center">
							<span className="text-4xl font-black tracking-tighter text-foreground">
								{overallRiskPct}%
							</span>
							<p
								className="text-xs font-bold mt-1"
								style={{ color: gaugeColor }}
							>
								{gaugeLabel}
							</p>
						</div>
					</div>
				</div>

				{/* Widget 2: Risk Matrix Bubble Chart */}
				<div className="col-span-1 md:col-span-2 rounded-xl border bg-card p-5 shadow-sm">
					<h3 className="text-sm font-semibold mb-4 text-muted-foreground flex justify-between">
						<span>Risk Matrix</span>
						<span className="text-xs font-normal opacity-70">
							X: Days Remaining | Y: Risk Score
						</span>
					</h3>
					<div className="h-[220px]">
						<ChartContainer config={scatterConfig} className="w-full h-full">
							<ScatterChart
								margin={{ top: 10, right: 20, bottom: 10, left: -20 }}
							>
								<CartesianGrid strokeDasharray="3 3" vertical={false} />
								<XAxis
									type="number"
									dataKey="x"
									name="Days Remaining"
									unit=" days"
									fontSize={12}
									domain={["dataMin - 1", "dataMax + 2"]}
									reversed={true}
								/>
								<YAxis
									type="number"
									dataKey="y"
									name="Risk Score"
									unit="%"
									fontSize={12}
									domain={[0, 100]}
								/>
								<ZAxis
									type="number"
									dataKey="z"
									range={[50, 400]}
									name="Est. Hours"
								/>
								<ChartTooltip
									cursor={{ strokeDasharray: "3 3" }}
									content={({ active, payload }) => {
										if (active && payload?.length) {
											const data = payload[0].payload as TRiskStatsTask;
											return (
												<div className="rounded-lg border bg-background/95 p-3 shadow-xl backdrop-blur-sm w-80 max-w-[320px]">
													<p className="font-bold text-sm mb-1">{data.title}</p>
													<p className="text-xs text-muted-foreground mb-2">
														Assignee: {data.assignee_name}
													</p>
													<div className="grid grid-cols-2 gap-2 text-xs mb-2">
														<div>
															<span className="opacity-70">Risk:</span>{" "}
															<strong
																className="uppercase"
																style={{
																	color: getBubbleColor(data.risk_level),
																}}
															>
																{data.risk_level}
															</strong>
														</div>
														<div>
															<span className="opacity-70">Due:</span>{" "}
															<strong>{data.days_remaining}d</strong>
														</div>
													</div>
													{data.recommendation && (
														<div className="mt-2 text-xs bg-muted/50 p-2 rounded whitespace-normal">
															{data.recommendation}
														</div>
													)}
												</div>
											);
										}
										return null;
									}}
								/>
								<Scatter data={scatterData} name="Tasks">
									{scatterData.map((entry) => (
										<Cell
											key={`cell-${entry.task_id}`}
											fill={getBubbleColor(entry.risk_level)}
											opacity={0.8}
										/>
									))}
								</Scatter>
							</ScatterChart>
						</ChartContainer>
					</div>
				</div>

				{/* Widget 3: Radar Chart */}
				<div className="col-span-1 rounded-xl border bg-card p-5 shadow-sm">
					<h3 className="text-sm font-semibold mb-2 text-muted-foreground text-center">
						Core Risk Drivers
					</h3>
					<div className="h-[200px]">
						<ChartContainer config={radarConfig} className="w-full h-full">
							<RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
								<PolarGrid />
								<PolarAngleAxis dataKey="subject" fontSize={10} />
								<Radar
									name="Risk Factor"
									dataKey="value"
									fill="var(--color-value)"
									stroke="var(--color-value)"
									fillOpacity={0.25}
								/>
								<ChartTooltip content={<ChartTooltipContent />} />
							</RadarChart>
						</ChartContainer>
					</div>
				</div>
			</div>
		</div>
	);
};
