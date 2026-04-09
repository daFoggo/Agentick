import { SAMPLE_USER_1, SAMPLE_USER_2 } from "../users"

export const SAMPLE_TEAM_MEMBERS = [
  {
    id: "team-member-1",
    teamId: "team-1",
    userId: SAMPLE_USER_1.id,
    user: SAMPLE_USER_1,
    role: "member",
  },
  {
    id: "team-member-2",
    teamId: "team-1",
    userId: SAMPLE_USER_2.id,
    user: SAMPLE_USER_2,
    role: "member",
  },
]
