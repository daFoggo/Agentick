import {
	Activity,
	AlertTriangle,
	Brain,
	CheckCircle2,
	Clock,
	HelpCircle,
	ShieldAlert,
	Sparkles,
} from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TRiskSnapshot } from "../schemas";

interface TaskRiskPanelProps {
	projectId: string;
	taskId: string;
	initialSnapshot?: TRiskSnapshot | null;
	onAnalyze: () => Promise<any>;
	isAnalyzing: boolean;
}

export const TaskRiskPanel = ({
	initialSnapshot,
	onAnalyze,
	isAnalyzing,
}: TaskRiskPanelProps) => {
	const [snapshot, setSnapshot] = React.useState<TRiskSnapshot | null>(
		initialSnapshot || null,
	);

	React.useEffect(() => {
		if (initialSnapshot) {
			setSnapshot(initialSnapshot);
		}
	}, [initialSnapshot]);

	const handleRunAnalysis = async () => {
		try {
			const result = await onAnalyze();
			if (result) {
				setSnapshot(result);
			}
		} catch (err) {
			console.error(err);
		}
	};

	const getRiskColor = (level?: string) => {
		switch (level) {
			case "critical":
				return {
					text: "text-red-500",
					bg: "bg-red-500/10",
					border: "border-red-500/20",
					gradient: "from-red-500 to-orange-500",
					glow: "shadow-red-500/20",
				};
			case "high":
				return {
					text: "text-orange-500",
					bg: "bg-orange-500/10",
					border: "border-orange-500/20",
					gradient: "from-orange-500 to-amber-500",
					glow: "shadow-orange-500/20",
				};
			case "medium":
				return {
					text: "text-amber-500",
					bg: "bg-amber-500/10",
					border: "border-amber-500/20",
					gradient: "from-amber-500 to-yellow-500",
					glow: "shadow-amber-500/10",
				};
			default:
				return {
					text: "text-emerald-500",
					bg: "bg-emerald-500/10",
					border: "border-emerald-500/20",
					gradient: "from-emerald-500 to-teal-500",
					glow: "shadow-emerald-500/10",
				};
		}
	};

	const colors = getRiskColor(snapshot?.risk_level);

	return (
		<div className="relative overflow-hidden rounded-xl border border-muted-foreground/10 bg-linear-to-br from-background/40 to-muted/20 p-5 shadow-xl backdrop-blur-md">
			{/* Decorative Glow */}
			<div className="absolute -top-12 -right-12 size-36 rounded-full bg-primary/5 blur-2xl" />

			{/* Header */}
			<div className="mb-4 flex items-center justify-between gap-2 border-b border-muted-foreground/10 pb-3">
				<div className="flex items-center gap-2">
					<div className="relative flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
						<Brain className="size-4.5 animate-pulse" />
						<Sparkles className="absolute -top-1 -right-1 size-3 text-amber-400" />
					</div>
					<div>
						<h4 className="text-sm font-semibold tracking-tight">
							AI Risk Assistant
						</h4>
						<p className="text-xs text-muted-foreground">
							Automated delay risk analysis using AI
						</p>
					</div>
				</div>

				<Button
					type="button"
					size="sm"
					variant="outline"
					className="h-8 gap-1.5 border-primary/20 bg-primary/5 text-xs font-semibold hover:bg-primary/10"
					onClick={handleRunAnalysis}
					disabled={isAnalyzing}
				>
					{isAnalyzing ? (
						<>
							<Activity className="size-3.5 animate-spin" />
							Analyzing...
						</>
					) : (
						<>
							<Sparkles className="size-3.5" />
							Analyze Now
						</>
					)}
				</Button>
			</div>

			{snapshot ? (
				<div className="space-y-4">
					{/* Main Risk Score / Gauge */}
					<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<div className="space-y-1">
							<span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
								Risk Level
							</span>
							<div className="flex items-baseline gap-2">
								<span
									className={cn(
										"text-3xl font-extrabold tracking-tight capitalize",
										colors.text,
									)}
								>
									{snapshot.risk_level}
								</span>
								<span className="text-sm font-semibold text-muted-foreground">
									(Score: {(snapshot.risk_score * 100).toFixed(0)}%)
								</span>
							</div>
						</div>

						{/* Premium Visual Progress Bar */}
						<div className="w-full sm:max-w-[200px]">
							<div className="mb-1.5 flex justify-between text-xs font-medium text-muted-foreground">
								<span>Safe</span>
								<span>Dangerous</span>
							</div>
							<div className="h-2 w-full rounded-full bg-muted overflow-hidden">
								<div
									className={cn(
										"h-full rounded-full bg-linear-to-r transition-all duration-1000",
										colors.gradient,
									)}
									style={{ width: `${snapshot.risk_score * 100}%` }}
								/>
							</div>
						</div>
					</div>

					{/* AI Recommendation Alert Panel */}
					<div
						className={cn(
							"rounded-lg border p-3.5 transition-all",
							colors.bg,
							colors.border,
						)}
					>
						<div className="flex gap-2.5">
							<ShieldAlert
								className={cn("size-5 shrink-0 mt-0.5", colors.text)}
							/>
							<div className="space-y-1">
								<p className="text-xs font-bold text-foreground">
									AI Recommendation
								</p>
								<p className="text-sm leading-relaxed text-muted-foreground font-medium">
									{snapshot.recommendation || "No recommendation available."}
								</p>
							</div>
						</div>
					</div>

					{/* Detailed Programmatic Signals */}
					{snapshot.signals && (
						<div className="space-y-2">
							<span className="text-xs font-bold text-muted-foreground/80 uppercase tracking-wider">
								Analysis Signals
							</span>

							<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
								{/* Time Variance */}
								<div className="flex items-center gap-2 rounded-lg border bg-background/40 p-2.5 text-xs">
									<Clock className="size-4 text-primary" />
									<div className="min-w-0 flex-1">
										<p className="font-semibold text-muted-foreground">
											Estimation Variance
										</p>
										<p className="truncate font-bold text-foreground">
											{(snapshot.signals.time_variance_hours ?? 0) > 0
												? `Overrun by ${snapshot.signals.time_variance_hours}h`
												: `${snapshot.signals.actual_hours}h / ${snapshot.signals.estimated_hours || 0}h`}
										</p>
									</div>
									{snapshot.signals.is_over_estimate ? (
										<span className="size-2 rounded-full bg-red-500 animate-pulse" />
									) : (
										<CheckCircle2 className="size-4 text-emerald-500" />
									)}
								</div>

								{/* Blocked Status */}
								<div className="flex items-center gap-2 rounded-lg border bg-background/40 p-2.5 text-xs">
									<AlertTriangle
										className={cn(
											"size-4",
											snapshot.signals.is_blocked
												? "text-red-500"
												: "text-muted-foreground",
										)}
									/>
									<div className="min-w-0 flex-1">
										<p className="font-semibold text-muted-foreground">
											Task Status
										</p>
										<p className="truncate font-bold text-foreground">
											{snapshot.signals.is_blocked ? "Blocked" : "Active"}
										</p>
									</div>
									{snapshot.signals.is_blocked && (
										<span className="size-2 rounded-full bg-red-500 animate-pulse" />
									)}
								</div>

								{/* Schedule Bottleneck */}
								<div className="flex items-center gap-2 rounded-lg border bg-background/40 p-2.5 text-xs">
									<Clock
										className={cn(
											"size-4",
											snapshot.signals.has_schedule_bottleneck
												? "text-red-500"
												: "text-emerald-500",
										)}
									/>
									<div className="min-w-0 flex-1">
										<p className="font-semibold text-muted-foreground">
											Work Availability
										</p>
										<p className="truncate font-bold text-foreground">
											Needed:{" "}
											{(snapshot.signals.remaining_needed_hours ?? 0).toFixed(
												1,
											)}
											h / Free:{" "}
											{(snapshot.signals.available_working_hours ?? 0).toFixed(
												1,
											)}
											h
										</p>
									</div>
									{snapshot.signals.has_schedule_bottleneck ? (
										<span className="size-2 rounded-full bg-red-500 animate-pulse" />
									) : (
										<CheckCircle2 className="size-4 text-emerald-500" />
									)}
								</div>

								{/* Congestion */}
								<div className="flex items-center gap-2 rounded-lg border bg-background/40 p-2.5 text-xs">
									<Activity className="size-4 text-primary" />
									<div className="min-w-0 flex-1">
										<p className="font-semibold text-muted-foreground">
											Assignee Workload
										</p>
										<p className="truncate font-bold text-foreground">
											{snapshot.signals.parallel_tasks_count} parallel tasks
										</p>
									</div>
									{(snapshot.signals.parallel_tasks_count ?? 0) > 3 ? (
										<span className="size-2 rounded-full bg-orange-500 animate-pulse" />
									) : (
										<CheckCircle2 className="size-4 text-emerald-500" />
									)}
								</div>
							</div>

							{snapshot.signals.is_blocked &&
								snapshot.signals.blocked_reason && (
									<div className="rounded bg-red-500/5 border border-red-500/10 p-2.5 text-xs text-red-500 leading-relaxed">
										<strong>Blocked Reason:</strong>{" "}
										{snapshot.signals.blocked_reason}
									</div>
								)}
						</div>
					)}

					{/* Alert Status Footer */}
					{snapshot.alert_sent && (
						<div className="flex items-center gap-1.5 text-xs text-emerald-500/80 font-medium pt-1">
							<CheckCircle2 className="size-3.5" />
							<span>
								Automatically sent Telegram alert to Team Lead & Dev at{" "}
								{snapshot.alert_sent_at
									? new Date(snapshot.alert_sent_at).toLocaleTimeString()
									: ""}
							</span>
						</div>
					)}
				</div>
			) : (
				<div className="py-8 text-center">
					<HelpCircle className="mx-auto size-10 text-muted-foreground/30 mb-2" />
					<p className="text-sm font-semibold text-muted-foreground">
						No analysis result yet
					</p>
					<p className="text-xs text-muted-foreground/70 max-w-sm mx-auto mt-1">
						Click &ldquo;Analyze Now&rdquo; to analyze signals and generate
						forecasts.
					</p>
				</div>
			)}
		</div>
	);
};
