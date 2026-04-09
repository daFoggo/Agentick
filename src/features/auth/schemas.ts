import { z } from "zod"
import { UserSchema } from "../users"

export type TUser = z.infer<typeof UserSchema>

/**
 * @description Sign In Business Logic
 */
export const SignInSchema = z.object({
  email__eq: z.email(),
  password: z.string().min(6),
})

export const SignInResponseSchema = z.object({
  access_token: z.string(),
  expiration: z.string(),
  refresh_token: z.string(),
  refresh_expiration: z.string(),
  user_info: UserSchema,
})

export type TSignInInput = z.infer<typeof SignInSchema>
export type TSignInResponse = z.infer<typeof SignInResponseSchema>

/**
 * @description Refresh Token Logic
 */
export const RefreshTokenInputSchema = z.object({
  refresh_token: z.string(),
})

export const TokenResponseSchema = z.object({
  access_token: z.string(),
  expiration: z.string(),
  refresh_token: z.string(),
  refresh_expiration: z.string(),
})

export type TRefreshTokenInput = z.infer<typeof RefreshTokenInputSchema>
export type TTokenResponse = z.infer<typeof TokenResponseSchema>

/**
 * @description Sign Up Business Logic
 */
export const SignUpSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
  name: z.string().min(3),
  avatarUrl: z.url().optional().or(z.literal("")),
})

export const SignUpResponseSchema = UserSchema

export type TSignUpInput = z.infer<typeof SignUpSchema>
export type TSignUpResponse = z.infer<typeof SignUpResponseSchema>
