import type { IUser } from "../users"

export type TProjectRole = "manager" | "member" | "viewer"

export interface IProjectMember {
  id: string
  user?: IUser
  userId: string
  projectId: string
  role: TProjectRole
  joinedAt?: Date
}
