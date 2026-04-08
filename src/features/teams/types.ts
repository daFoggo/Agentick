import type { TProject } from "../projects"
import type { ITeamMember } from "../team-members"

export interface ITeam {
  id: string
  name: string
  avatarUrl?: string
  members?: ITeamMember[]
  projects?: TProject[]
  createdAt?: string
}
