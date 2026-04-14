import { SAMPLE_PROJECT_MEMBERS } from "../project-members/sample-data"
import { SAMPLE_TEAM } from "../teams/sample-data"
import type { TProject } from "./schemas"

export const SAMPLE_PROJECTS: TProject[] = [
  {
    id: "project-1",
    team_id: SAMPLE_TEAM.id,
    name: "Project 1",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    avatar_url: null,
    is_deleted: false,
    members: SAMPLE_PROJECT_MEMBERS,
    tasks: [],
    created_at: "2026-03-31T10:01:00Z",
    updated_at: "2026-03-31T10:01:00Z",
  },
  {
    id: "project-2",
    team_id: SAMPLE_TEAM.id,
    name: "Project 2",
    description:
      "A second project for demonstration purposes with different details and members.",
    avatar_url: null,
    is_deleted: false,
    members: SAMPLE_PROJECT_MEMBERS,
    tasks: [],
    created_at: "2026-03-31T12:00:00Z",
    updated_at: "2026-03-31T12:00:00Z",
  },
]
