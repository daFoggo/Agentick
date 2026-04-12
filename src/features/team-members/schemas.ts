import { z } from "zod"
import { UserSchema } from "../users"

/**
 * @description Team Role Schema
 */
export const TeamRoleSchema = z.enum(["owner", "manager", "member", "viewer"])

/**
 * @description Team Member Schema
 */
export const TeamMemberSchema = z.object({
  id: z.string(),
  userId: z.string(),
  teamId: z.string(),
  role: TeamRoleSchema,
  joinedAt: z.string().datetime().optional(),
  user: UserSchema.optional(), // Đối chiếu thông tin user
})

export type TTeamRole = z.infer<typeof TeamRoleSchema>
export type TTeamMember = z.infer<typeof TeamMemberSchema>
