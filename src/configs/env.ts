import { z } from "zod"

/**
 * @description Environment variables schema and validation (TanStack Start / Vite Version)
 * We emulate the @t3-oss/env-nextjs behavior but optimized for Vite.
 */

const serverSchema = z.object({
  DATABASE_URL: z.string().url(),
  OPEN_AI_API_KEY: z.string().min(1),
  SELINE_TOKEN: z.string().min(1),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
})

const clientSchema = z.object({
  VITE_BACKEND_URL: z.string().url(),
  VITE_APP_NAME: z.string().default("My TanStack App"),
})

/**
 * Internal logic for processing env
 */
const _isServer = typeof window === "undefined"

// Validate Client Env immediately
const clientEnvResult = clientSchema.safeParse(import.meta.env)
if (!clientEnvResult.success) {
  console.error(
    "Invalid client-side environment variables:",
    clientEnvResult.error.flatten().fieldErrors
  )
  // Fail fast in development
  if (import.meta.env.DEV) {
    throw new Error(
      "Missing or invalid client-side environment variables. Check your .env file."
    )
  }
}
const clientEnv = clientEnvResult.success
  ? clientEnvResult.data
  : ({} as z.infer<typeof clientSchema>)

/**
 * Validated environment configuration object.
 * Emulates the same usage as your Next.js project.
 */
let _envInternal = { ...clientEnv } as any

if (_isServer) {
  const serverEnvResult = serverSchema.safeParse(process.env)
  if (!serverEnvResult.success) {
    console.error(
      "Invalid server-side environment variables:",
      serverEnvResult.error.flatten().fieldErrors
    )
    // On server (SSR or Server Function), invalid env should usually be a hard failure
    throw new Error("Missing or invalid server-side environment variables.")
  }
  Object.assign(_envInternal, serverEnvResult.data)
}

/**
 * Proxy to prevent accidental leakage of server-side secrets to the client.
 * If you try to access a server variable (like OPEN_AI_API_KEY) in a client component,
 * it will throw a clear error instead of returning undefined.
 */
export const envConfig = new Proxy(_envInternal, {
  get(target, prop: string) {
    if (!_isServer && !prop.startsWith("VITE_")) {
      // List of server-only keys from the schema above
      const serverKeys = [
        "DATABASE_URL",
        "OPEN_AI_API_KEY",
        "SELINE_TOKEN",
        "NODE_ENV",
      ]
      if (serverKeys.includes(prop)) {
        throw new Error(
          `SECURITY ERROR: ATTEMPT TO ACCESS SERVER-SIDE VARIABLE "${prop}" ON THE CLIENT.\n` +
            `Server variables stay on the server. To use this logic, wrap it in a createServerFn().`
        )
      }
    }
    return target[prop]
  },
}) as z.infer<typeof clientSchema> & z.infer<typeof serverSchema>

// Helper for explicit server access if needed
export const getServerEnv = () => {
  if (!_isServer) throw new Error("getServerEnv() only allowed on server.")
  return serverSchema.parse(process.env)
}
