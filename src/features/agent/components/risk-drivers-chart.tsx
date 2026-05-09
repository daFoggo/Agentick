import { memo, useMemo } from "react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
} from "@/components/ui/chart";
import type { TRiskStatsTask } from "../schemas";

interface IRiskDriversChartProps {
	tasks: TRiskStatsTask[];
}

const radarConfig = {
	value: {
		label: "Risk Factor",
		color: "var(--destructive)",
	},
} satisfies ChartConfig;

export const RiskDriversChart = memo(({ tasks }: IRiskDriversChartProps) => {
	const radarData = useMemo(() => {
		let totalTimeVar = 0,
			totalSched = 0,
			totalCongest = 0,
			totalBlocked = 0;
		const numTasks = tasks.length || 1;

		tasks.forEach((t) => {
			if (t.signals) {
				if (t.signals.is_over_estimate) totalTimeVar += 100;
				if (t.signals.has_schedule_bottleneck) totalSched += 100;
				if (
					t.signals.parallel_tasks_count &&
					t.signals.parallel_tasks_count > 3
				)
					totalCongest += 100;
				if (t.signals.is_blocked) totalBlocked += 100;
			}
		});

		return [
			{ subject: "Time Overrun", value: totalTimeVar / numTasks },
			{ subject: "Bottleneck", value: totalSched / numTasks },
			{ subject: "Congestion", value: totalCongest / numTasks },
			{ subject: "Blocked", value: totalBlocked / numTasks },
			{
				subject: "Critical Deadline",
				value:
					(tasks.filter((t) => t.days_remaining <= 2 && t.days_remaining >= 0)
						.length /
						numTasks) *
					100,
			},
		];
	}, [tasks]);

	return (
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
						<ChartTooltip
							content={({ active, payload }) => {
								if (active && payload?.length) {
									return (
										<div className="rounded-lg border bg-background/95 p-2 shadow-xl backdrop-blur-sm text-xs">
											<p className="font-bold mb-1">{payload[0].name}</p>
											<p className="text-muted-foreground">
												Value:{" "}
												<strong>
													{Math.round(payload[0].value as number)}%
												</strong>
											</p>
										</div>
									);
								}
								return null;
							}}
						/>
					</RadarChart>
				</ChartContainer>
			</div>
		</div>
	);
});

RiskDriversChart.displayName = "RiskDriversChart";
