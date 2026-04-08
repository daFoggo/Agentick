import "@tanstack/react-start/server-only"
import { SAMPLE_PROJECTS } from "./sample-data"
import type { TProject, TGetProjectsInput } from "./schemas"
import type { TBaseResponse } from "@/types/api"

/**
 * @description Lấy danh sách projects (Mocking API behavior)
 */
export async function fetchProjects(
  _params: TGetProjectsInput
): Promise<TBaseResponse<TProject[]>> {
  await new Promise((resolve) => setTimeout(resolve, 300))
  
  return {
    success: true,
    message: "Fetched projects successfully",
    data: SAMPLE_PROJECTS as TProject[]
  }
}

/**
 * @description Lấy chi tiết project theo ID
 */
export async function fetchProjectById(
  projectId: string
): Promise<TBaseResponse<TProject | null>> {
  await new Promise((resolve) => setTimeout(resolve, 300))

  const project = SAMPLE_PROJECTS.find((p) => p.id === projectId)
  
  return {
    success: true,
    message: project ? "Project found" : "Project not found",
    data: (project as TProject) || null
  }
}
