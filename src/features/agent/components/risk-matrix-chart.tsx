import { memo, useMemo } from "react";
import {
	CartesianGrid,
	Cell,
	Scatter,
	ScatterChart,
	XAxis,
	YAxis,
	ZAxis,
} from "recharts";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
} from "@/components/ui/chart";
import type { TRiskStatsTask } from "../schemas";

interface IRiskMatrixChartProps {
	tasks: TRiskStatsTask[];
}

const scatterConfig = {
	critical: { label: "Critical", color: "var(--destructive)" },
	high: { label: "High", color: "var(--chart-4)" },
	medium: { label: "Warning", color: "var(--chart-3)" },
	low: { label: "Safe", color: "var(--chart-2)" },
} satisfies ChartConfig;

export const RiskMatrixChart = memo(({ tasks }: IRiskMatrixChartProps) => {
	const scatterData = useMemo(() => {
		return tasks.map((t) => ({
			...t,
			x: t.days_remaining,
			y: t.risk_score * 100,
			z: t.estimated_hours || 1,
		}));
	}, [tasks]);

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

	return (
		<div className="col-span-1 md:col-span-2 rounded-xl border bg-card p-5 shadow-sm">
			<h3 className="text-sm font-semibold mb-4 text-muted-foreground flex justify-between">
				<span>Risk Matrix</span>
				<span className="text-xs font-normal opacity-70">
					X: Days Remaining | Y: Risk Score
				</span>
			</h3>
			<div className="h-[220px]">
				<ChartContainer config={scatterConfig} className="w-full h-full">
					<ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: -20 }}>
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
	);
});

RiskMatrixChart.displayName = "RiskMatrixChart";
