import { SAMPLE_PROJECT_MEMBERS } from "../project-members/sample-data"
import { SAMPLE_TEAM } from "../teams/sample-data"
import type { TProject } from "./types"

export const SAMPLE_PROJECTS: TProject[] = [
  {
    id: "project-1",
    teamId: SAMPLE_TEAM.id,
    name: "Project 1",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    members: SAMPLE_PROJECT_MEMBERS,
    tasks: [],
    createdAt: "2026-03-31T10:01:00.000Z",
  },
  {
    id: "project-2",
    teamId: SAMPLE_TEAM.id,
    name: "Project 2",
    description:
      "A second project for demonstration purposes with different details and members.",
    members: SAMPLE_PROJECT_MEMBERS,
    tasks: [],
    createdAt: "2026-03-31T12:00:00.000Z",
  },
]
