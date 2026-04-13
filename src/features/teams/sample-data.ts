import { SAMPLE_TEAM_MEMBERS } from "../team-members/sample-data"
import type { TTeam } from "./schemas"

export const SAMPLE_TEAM: TTeam = {
  id: "team-1",
  name: "RIPT",
  description: "Research Institute of Post and Telecommunications",
  avatar_url: "",
  owner_id: "user-1",
  members: SAMPLE_TEAM_MEMBERS,
  projects: [],
  created_at: "2026-03-31T10:01:00.000Z",
}
