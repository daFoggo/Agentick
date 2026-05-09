import { memo } from "react";
import { RadialBar, RadialBarChart } from "recharts";
import { type ChartConfig, ChartContainer } from "@/components/ui/chart";

interface IProjectRiskGaugeProps {
	overallRiskIndex: number;
}

const gaugeConfig = {
	riskIndex: {
		label: "Risk Index",
	},
} satisfies ChartConfig;

export const ProjectRiskGauge = memo(
	({ overallRiskIndex }: IProjectRiskGaugeProps) => {
		const overallRiskPct = Math.round(overallRiskIndex * 100);
		let gaugeColor = "var(--chart-2)";
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

		return (
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
						<p className="text-xs font-bold mt-1" style={{ color: gaugeColor }}>
							{gaugeLabel}
						</p>
					</div>
				</div>
			</div>
		);
	},
);

ProjectRiskGauge.displayName = "ProjectRiskGauge";
