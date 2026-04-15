import { z } from "zod"
import {
  ApiDateSchema,
  FindOrderingSchema,
  FindPageSchema,
  FindPageSizeWithAllSchema,
} from "@/lib/zod-common"
import type { TBaseFindResponse, TBaseSearchOptions } from "@/types/api"

export const PhaseSchema = z.object({
  id: z.string(),
  created_at: ApiDateSchema,
  updated_at: ApiDateSchema,
  project_id: z.string(),
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  order: z.number(),
  start_date: ApiDateSchema.optional().nullable(),
  end_date: ApiDateSchema.optional().nullable(),
})

export const PhaseCreateSchema = z.object({
  project_id: z.string().optional(),
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  order: z.number().int(),
  start_date: ApiDateSchema.optional().nullable(),
  end_date: ApiDateSchema.optional().nullable(),
})

export const PhaseUpdateSchema = PhaseCreateSchema.omit({
  project_id: true,
}).partial()

export const PhaseFindSchema = z
  .object({
    id__eq: z.string().optional(),
    name__ilike: z.string().optional(),
    page: FindPageSchema,
    page_size: FindPageSizeWithAllSchema,
    ordering: FindOrderingSchema,
  })
  .optional()

export type TPhaseSearchOptions = TBaseSearchOptions<number | "all", string>

export type TPhasesResponse = TBaseFindResponse<TPhase, TPhaseSearchOptions>

export type TPhase = z.infer<typeof PhaseSchema>
export type TPhaseCreateInput = z.infer<typeof PhaseCreateSchema>
export type TPhaseUpdateInput = z.infer<typeof PhaseUpdateSchema>
export type TPhaseFindInput = z.infer<typeof PhaseFindSchema>