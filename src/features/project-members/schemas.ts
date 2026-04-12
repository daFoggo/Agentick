import { z } from "zod"
import { UserSchema } from "../users"

/**
 * @description Project Role Schema
 */
export const ProjectRoleSchema = z.enum(["manager", "member", "viewer"])

/**
 * @description Project Member Schema
 */
export const ProjectMemberSchema = z.object({
  id: z.string(),
  userId: z.string(),
  projectId: z.string(),
  role: ProjectRoleSchema,
  joinedAt: z.string().datetime().optional(),
  user: UserSchema.optional(),
})

export type TProjectRole = z.infer<typeof ProjectRoleSchema>
export type TProjectMember = z.infer<typeof ProjectMemberSchema>
