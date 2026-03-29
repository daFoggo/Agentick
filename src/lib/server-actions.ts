import { createServerFn } from "@tanstack/react-start"
import { getServerEnv } from "../configs/env"

/**
 * Example Server Function accessing server-only environment variables securely.
 */
export const getSecretData = createServerFn({ method: "GET" }).handler(
  async () => {
    const { OPEN_AI_API_KEY } = getServerEnv()

    // In a real app, you would use this key to fetch data from an external API
    // const response = await fetch('https://api.openai.com/v1/models', {
    //   headers: { Authorization: `Bearer ${OPEN_AI_API_KEY}` }
    // });

    return {
      message: "This data was fetched using the migrated OpenAI secret.",
      status: OPEN_AI_API_KEY ? "Authenticated" : "No Secret Found",
    }
  }
)
