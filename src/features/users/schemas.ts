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

/**
 * @description User Search Result Schema — subset an toàn, không có sensitive data
 */
export const UserSearchResultSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
  avatar_url: z.string().nullable().optional(),
})

export const SearchUsersInputSchema = z.object({
  q: z.string().min(1).max(100),
  limit: z.number().min(1).max(50).optional(),
  team_id: z.string().optional(),
})

export type TUserSearchResult = z.infer<typeof UserSearchResultSchema>
