import { z } from "zod"

/**
 * @description User Schema & Type (Single Source of Truth) - Using snake_case
 */
export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
  avatar_url: z.url().optional().or(z.literal("")),
  created_at: z.iso.datetime(),
})

export type TUser = z.infer<typeof UserSchema>
