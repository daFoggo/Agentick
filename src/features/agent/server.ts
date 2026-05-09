import { api } from "@/lib/ky";
import type { TBaseResponse } from "@/types/api";
import "@tanstack/react-start/server-only";
import type { TProjectRiskStats, TRiskSnapshot } from "./schemas";

export async function analyzeTaskRisk(taskId: string): Promise<TRiskSnapshot> {
	const response = await api
		.post(`agent/analyze-risk/${taskId}`)
		.json<TBaseResponse<TRiskSnapshot>>();
	return response.data;
}

export async function analyzeProjectRisk(
	projectId: string,
): Promise<{ analyzed_count: number }> {
	const response = await api
		.post(`agent/analyze-project-risk/${projectId}`)
		.json<TBaseResponse<{ analyzed_count: number }>>();
	return response.data;
}

export async function fetchProjectRiskStats(
	projectId: string,
): Promise<TProjectRiskStats> {
	const response = await api
		.get(`projects/${projectId}/tasks/risk-stats`)
		.json<TBaseResponse<TProjectRiskStats>>();
	return response.data;
}
