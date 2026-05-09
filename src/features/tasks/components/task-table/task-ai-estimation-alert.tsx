import { Sparkles } from "lucide-react";
import { memo } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ITaskAIEstimationAlertProps {
	aiExplanation: {
		suggested_hours: number;
		rationale: string;
		similar_cases_count?: number;
		reasoning_steps?: {
			similarity_analysis?: string;
			variance_analysis?: string;
		};
	} | null;
}

export const TaskAIEstimationAlert = memo(
	({ aiExplanation }: ITaskAIEstimationAlertProps) => {
		if (!aiExplanation) return null;

		return (
			<Alert>
				<Sparkles className="size-4" />
				<AlertTitle>Estimated Hours Explanation</AlertTitle>
				<AlertDescription className="text-xs flex flex-col gap-1">
					<span className="w-full">{aiExplanation.rationale}</span>
					{aiExplanation.reasoning_steps && (
						<div className="flex flex-col gap-1 w-full">
							{aiExplanation.similar_cases_count !== undefined && (
								<span className="w-full">
									<strong>Similar Cases Analyzed:</strong>{" "}
									{aiExplanation.similar_cases_count}
								</span>
							)}
							{aiExplanation.reasoning_steps.similarity_analysis && (
								<span className="w-full">
									<strong>Similarity:</strong>{" "}
									{aiExplanation.reasoning_steps.similarity_analysis}
								</span>
							)}
							{aiExplanation.reasoning_steps.variance_analysis && (
								<span className="w-full">
									<strong>Accuracy:</strong>{" "}
									{aiExplanation.reasoning_steps.variance_analysis}
								</span>
							)}
						</div>
					)}
				</AlertDescription>
			</Alert>
		);
	},
);

TaskAIEstimationAlert.displayName = "TaskAIEstimationAlert";
