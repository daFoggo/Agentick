import '@tanstack/react-start/server-only'

import { SAMPLE_PROJECTS } from "./sample-data"
import type { IProject } from "./types"
import type { GetProjectsInput } from "./schemas"

export async function fetchProjects(_params: GetProjectsInput): Promise<IProject[]> {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return SAMPLE_PROJECTS
}

export async function fetchProjectById(projectId: string): Promise<IProject | null> {
  await new Promise((resolve) => setTimeout(resolve, 300))

  const project = SAMPLE_PROJECTS.find((p) => p.id === projectId)
  return project || null
}
