import { createServerFn } from "@tanstack/react-start"
import { requestLoggerMiddleware } from "@/lib/middleware"
import { SignInSchema, SignUpSchema } from "./schemas"
import { signIn, signUp } from "./server"

export const signInFn = createServerFn({ method: "POST" })
  .middleware([requestLoggerMiddleware])
  .inputValidator(SignInSchema)
  .handler(({ data }) => signIn(data))

export const signUpFn = createServerFn({ method: "POST" })
  .middleware([requestLoggerMiddleware])
  .inputValidator(SignUpSchema)
  .handler(({ data }) => signUp(data))
