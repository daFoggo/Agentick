import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requestLoggerMiddleware } from "@/lib/middleware";
import {
	PhaseCreateSchema,
	PhaseFindSchema,
	PhaseUpdateSchema,
} from "./schemas";
import {
	createPhase,
	deletePhase,
	fetchPhaseById,
	fetchPhases,
	updatePhase,
} from "./server";

export const getPhasesFn = createServerFn({ method: "GET" })
	.middleware([requestLoggerMiddleware])
	.inputValidator(
		z.object({
			projectId: z.string(),
			params: PhaseFindSchema,
		}),
	)
	.handler(async ({ data }) => fetchPhases(data.projectId, data.params));

export const getPhaseByIdFn = createServerFn({ method: "GET" })
	.middleware([requestLoggerMiddleware])
	.inputValidator(
		z.object({
			projectId: z.string(),
			phaseId: z.string(),
		}),
	)
	.handler(async ({ data }) => fetchPhaseById(data.projectId, data.phaseId));

export const createPhaseFn = createServerFn({ method: "POST" })
	.middleware([requestLoggerMiddleware])
	.inputValidator(
		z.object({
			projectId: z.string(),
			payload: PhaseCreateSchema,
		}),
	)
	.handler(async ({ data }) => createPhase(data.projectId, data.payload));

export const updatePhaseFn = createServerFn({ method: "POST" })
	.middleware([requestLoggerMiddleware])
	.inputValidator(
		z.object({
			projectId: z.string(),
			phaseId: z.string(),
			payload: PhaseUpdateSchema,
		}),
	)
	.handler(async ({ data }) =>
		updatePhase(data.projectId, data.phaseId, data.payload),
	);

export const deletePhaseFn = createServerFn({ method: "POST" })
	.middleware([requestLoggerMiddleware])
	.inputValidator(
		z.object({
			projectId: z.string(),
			phaseId: z.string(),
		}),
	)
	.handler(async ({ data }) => deletePhase(data.projectId, data.phaseId));
