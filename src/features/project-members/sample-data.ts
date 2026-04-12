import { SAMPLE_USER_1, SAMPLE_USER_2, SAMPLE_USER_3 } from "../users"
import type { TProjectMember } from "./schemas"

export const SAMPLE_PROJECT_MEMBERS: TProjectMember[] = [
  {
    id: "project-member-1",
    projectId: "project-1",
    userId: SAMPLE_USER_1.id,
    user: SAMPLE_USER_1,
    role: "member",
  },
  {
    id: "project-member-2",
    projectId: "project-1",
    userId: SAMPLE_USER_2.id,
    user: SAMPLE_USER_2,
    role: "member",
  },
  {
    id: "project-member-3",
    projectId: "project-1",
    userId: SAMPLE_USER_3.id,
    user: SAMPLE_USER_3,
    role: "member",
  },
]
