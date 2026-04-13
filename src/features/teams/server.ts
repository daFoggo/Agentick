import "@tanstack/react-start/server-only"
import { api } from "@/lib/ky"
import type { TBaseResponse } from "@/types/api"
import type { TTeam } from "./schemas"

/**
 * @description Lấy danh sách teams
 */
export async function fetchTeams(params?: {
  name__ilike?: string
  page?: number
  size?: number
}): Promise<TTeam[]> {
  const response = await api
    .get("teams", { searchParams: params })
    .json<TBaseResponse<{ founds: TTeam[]; total: number }>>()

  return response.data.founds
}

/**
 * @description Lấy chi tiết team theo ID
 */
export async function fetchTeamById(teamId: string): Promise<TTeam | null> {
  try {
    const response = await api.get(`teams/${teamId}`).json<TBaseResponse<TTeam>>()
    return response.data
  } catch (error) {
    console.error("error fetch team detail: ", error)
    return null
  }
}

/**
 * @description Tạo team mới
 */
export async function createTeam(data: Partial<TTeam>): Promise<TTeam> {
  const response = await api.post("teams", { json: data }).json<TBaseResponse<TTeam>>()
  return response.data
}

/**
 * @description Cập nhật thông tin team
 */
export async function updateTeam(
  teamId: string,
  data: Partial<TTeam>
): Promise<TTeam> {
  const response = await api
    .patch(`teams/${teamId}`, { json: data })
    .json<TBaseResponse<TTeam>>()
  return response.data
}

/**
 * @description Xóa team (Soft Delete)
 */
export async function deleteTeam(teamId: string): Promise<void> {
  await api.delete(`teams/${teamId}`).json<TBaseResponse<void>>()
}
