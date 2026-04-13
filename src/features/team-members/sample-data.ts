import type { TTeamMember } from "./schemas"
import { SAMPLE_USER_1, SAMPLE_USER_2 } from "../users"

export const SAMPLE_TEAM_MEMBERS: TTeamMember[] = [
  {
    id: "team-member-1",
    team_id: "team-1",
    user_id: SAMPLE_USER_1.id,
    user: SAMPLE_USER_1,
    role: "member",
  },
  {
    id: "team-member-2",
    team_id: "team-1",
    user_id: SAMPLE_USER_2.id,
    user: SAMPLE_USER_2,
    role: "member",
  },
]
