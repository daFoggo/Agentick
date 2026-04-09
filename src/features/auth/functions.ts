import { createServerFn } from "@tanstack/react-start"
import { requestLoggerMiddleware } from "@/lib/middleware"
import { SignInSchema, SignUpSchema } from "./schemas"
import { signIn, signUp } from "./server"

export const signInFn = createServerFn({ method: "POST" })
  .middleware([requestLoggerMiddleware])
  .inputValidator(SignInSchema)
  .handler(async ({ data }) => {
    const { useAppSession } = await import("@/lib/session.server")
    const response = await signIn(data)
    const session = await useAppSession()
    await session.update({
      access_token: response.access_token,
      refresh_token: response.refresh_token,
    })
    return response
  })

export const signUpFn = createServerFn({ method: "POST" })
  .middleware([requestLoggerMiddleware])
  .inputValidator(SignUpSchema)
  .handler(async ({ data }) => {
    const response = await signUp(data)
    return response
  })
