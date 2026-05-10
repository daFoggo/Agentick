import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const ProjectAISummary = memo(
	({ projectId: _projectId }: { projectId?: string }) => {
		return (
			<Card>
				<CardHeader>
					<CardTitle>AI Summary</CardTitle>
				</CardHeader>
				<CardContent>
					Generate AI evaluation on demand. This will use historical execution
					data to provide risk insights.
				</CardContent>
			</Card>
		);
	},
);

ProjectAISummary.displayName = "ProjectAISummary";

export default ProjectAISummary;
