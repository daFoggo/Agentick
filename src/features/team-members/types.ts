import type { TUser } from "../users"

export type TTeamRole = "owner" | "manager" | "member" | "viewer"

export interface ITeamMember {
  id: string
  user?: TUser
  userId: string
  teamId: string
  role: TTeamRole
  joinedAt?: Date
}
