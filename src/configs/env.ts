import { z } from "zod"

/**
 * @description CLIENT-SIDE environment variables.
 */
const clientEnvSchema = z.object({
  VITE_API_CORE_URL: z.url(),
  VITE_API_AI_URL: z.url(),
  VITE_APP_NAME: z.string().default("Agentick App"),
})

export const clientEnv = clientEnvSchema.parse(import.meta.env)

/**
 * @description Centralized API configuration mapping.
 * Hỗ trợ cả URL gốc (Base) cho Static files và URL API (API) cho requests.
 */
export const API_ENDPOINTS = {
  // Base Origins (Dùng cho static files, uploads, v.v.)
  CORE_BASE_URL: clientEnv.VITE_API_CORE_URL,
  AI_BASE_URL: clientEnv.VITE_API_AI_URL,

  // API Endpoints (Dùng cho Ky / Fetcher)
  CORE_API_URL: `${clientEnv.VITE_API_CORE_URL}/api/v1`,
  AI_API_URL: `${clientEnv.VITE_API_AI_URL}/api/v1`,
} as const

export type TApiEndpoints = typeof API_ENDPOINTS
