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
