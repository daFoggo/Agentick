import type { IUser } from "../users"

export type TTeamRole = "owner" | "manager" | "member" | "viewer"

export interface ITeamMember {
  id: string
  user?: IUser
  userId: string
  teamId: string
  role: TTeamRole
  joinedAt?: Date
}
