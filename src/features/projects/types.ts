import type { IProjectMember } from "../project-members"
import type { ITask } from "../tasks"

export interface IProject {
  id: string
  teamId: string
  avatarUrl?: string
  name: string
  description?: string
  members?: IProjectMember[]
  tasks?: ITask[]

  createdAt?: string
}
