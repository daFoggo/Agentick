import { api } from "@/lib/ky"
import type { TBaseResponse } from "@/types/api"
import "@tanstack/react-start/server-only"
import type {
  TGetProjectsInput,
  TProject,
  TProjectsResponse,
} from "./schemas"
import { z } from "zod"
import { CreateProjectSchema, UpdateProjectSchema } from "./schemas"

/**
 * @description Lấy danh sách projects có filter + pagination
 */
export async function fetchProjects(
  params?: TGetProjectsInput
): Promise<TProjectsResponse> {
  const response = await api
    .get("projects", { searchParams: params as Record<string, string | number | boolean> | undefined })
    .json<TBaseResponse<TProjectsResponse>>()

  return response.data
}

/**
 * @description Lấy danh sách projects của user hiện tại
 */
export async function fetchMyProjects(): Promise<TProject[]> {
  const response = await api.get("projects/me").json<TBaseResponse<TProject[]>>()
  return response.data
}

/**
 * @description Lấy chi tiết project theo ID
 */
export async function fetchProjectById(
  projectId: string
): Promise<TProject | null> {
  try {
    const response = await api.get(`projects/${projectId}`).json<TBaseResponse<TProject>>()
    return response.data
  } catch (error) {
    console.error("error fetch project detail: ", error)
    return null
  }
}

/**
 * @description Tạo project mới
 */
export async function createProject(
  payload: z.infer<typeof CreateProjectSchema>
): Promise<TProject> {
  const response = await api
    .post("projects", { json: payload })
    .json<TBaseResponse<TProject>>()
  
  return response.data
}

/**
 * @description Cập nhật project
 */
export async function updateProject(
  projectId: string,
  payload: z.infer<typeof UpdateProjectSchema>
): Promise<TProject> {
  const response = await api
    .patch(`projects/${projectId}`, { json: payload })
    .json<TBaseResponse<TProject>>()

  return response.data
}

/**
 * @description Xóa project (soft delete)
 */
export async function deleteProject(projectId: string): Promise<boolean> {
  const response = await api.delete(`projects/${projectId}`).json<TBaseResponse<boolean>>()
  return response.data
}

