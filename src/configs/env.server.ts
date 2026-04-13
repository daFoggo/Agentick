import "@tanstack/react-start/server-only"
import { z } from "zod"

/**
 * @description SERVER-SIDE ONLY environment variables.
 * These variables contain sensitive secrets (API keys, DB URLs).
 * The 'server-only' import above ensures this file NEVER reaches the browser bundle.
 */
const serverEnvSchema = z.object({
  DATABASE_URL: z.url(),
  OPEN_AI_API_KEY: z.string().min(1),
  SELINE_TOKEN: z.string().min(1),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
})

// Validate and export server environment
// Accessible only in server functions, loaders (on server), and API routes.
export const serverEnv = serverEnvSchema.parse(process.env)
