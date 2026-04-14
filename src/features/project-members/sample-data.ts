import { SAMPLE_USER_1, SAMPLE_USER_2, SAMPLE_USER_3 } from "../users"
import type { TProjectMember } from "./schemas"

export const SAMPLE_PROJECT_MEMBERS: TProjectMember[] = [
  {
    id: "project-member-1",
    project_id: "project-1",
    user_id: SAMPLE_USER_1.id,
    user: SAMPLE_USER_1,
    role: "owner",
    joined_at: "2026-03-31T10:01:00Z",
    created_at: "2026-03-31T10:01:00Z",
    updated_at: "2026-03-31T10:01:00Z",
  },
  {
    id: "project-member-2",
    project_id: "project-1",
    user_id: SAMPLE_USER_2.id,
    user: SAMPLE_USER_2,
    role: "member",
    joined_at: "2026-03-31T10:02:00Z",
    created_at: "2026-03-31T10:02:00Z",
    updated_at: "2026-03-31T10:02:00Z",
  },
  {
    id: "project-member-3",
    project_id: "project-1",
    user_id: SAMPLE_USER_3.id,
    user: SAMPLE_USER_3,
    role: "member",
    joined_at: "2026-03-31T10:03:00Z",
    created_at: "2026-03-31T10:03:00Z",
    updated_at: "2026-03-31T10:03:00Z",
  },
]
