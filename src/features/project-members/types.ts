import type { TUser } from "../auth"

export type TProjectRole = "manager" | "member" | "viewer"

export interface IProjectMember {
  id: string
  user?: TUser
  userId: string
  projectId: string
  role: TProjectRole
  joinedAt?: Date
}
