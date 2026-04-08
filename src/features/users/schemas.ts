import { z } from "zod"

/**
 * @description User Schema & Type (Single Source of Truth)
 */
export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
  avatarUrl: z.url().optional(),
  createdAt: z.iso.datetime(),
})

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
  user_info: UserSchema,
})

export type TSignInInput = z.infer<typeof SignInSchema>
export type TSignInResponse = z.infer<typeof SignInResponseSchema>

/**
 * @description Sign Up Business Logic
 */
export const SignUpSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
  name: z.string().min(3),
})

export const SignUpResponseSchema = UserSchema

export type TSignUpInput = z.infer<typeof SignUpSchema>
export type TSignUpResponse = z.infer<typeof SignUpResponseSchema>

