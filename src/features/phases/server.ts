import "@tanstack/react-start/server-only";
import { api } from "@/lib/ky";
import type { TBaseResponse } from "@/types/api";
import {
	PhaseCreateSchema,
	PhaseUpdateSchema,
	type TPhase,
	type TPhaseCreateInput,
	type TPhaseFindInput,
	type TPhasesResponse,
	type TPhaseUpdateInput,
} from "./schemas";

const buildPhasePath = (projectId: string) => `projects/${projectId}/phases`;

export async function fetchPhases(
	projectId: string,
	params?: TPhaseFindInput,
): Promise<TPhasesResponse> {
	const response = await api
		.get(buildPhasePath(projectId), {
			searchParams: params as
				| Record<string, string | number | boolean>
				| undefined,
		})
		.json<TBaseResponse<TPhasesResponse>>();

	return response.data;
}

export async function fetchPhaseById(
	projectId: string,
	phaseId: string,
): Promise<TPhase | null> {
	try {
		const response = await api
			.get(`${buildPhasePath(projectId)}/${phaseId}`)
			.json<TBaseResponse<TPhase>>();
		return response.data;
	} catch (error) {
		console.error("error fetch phase detail:", error);
		return null;
	}
}

export async function createPhase(
	projectId: string,
	payload: TPhaseCreateInput,
): Promise<TPhase> {
	const response = await api
		.post(buildPhasePath(projectId), {
			json: PhaseCreateSchema.parse(payload),
		})
		.json<TBaseResponse<TPhase>>();

	return response.data;
}

export async function updatePhase(
	projectId: string,
	phaseId: string,
	payload: TPhaseUpdateInput,
): Promise<TPhase> {
	const response = await api
		.patch(`${buildPhasePath(projectId)}/${phaseId}`, {
			json: PhaseUpdateSchema.parse(payload),
		})
		.json<TBaseResponse<TPhase>>();

	return response.data;
}

export async function deletePhase(
	projectId: string,
	phaseId: string,
): Promise<boolean> {
	const response = await api
		.delete(`${buildPhasePath(projectId)}/${phaseId}`)
		.json<TBaseResponse<boolean>>();

	return response.data;
}
