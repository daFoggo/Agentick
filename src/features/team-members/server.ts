import { api } from "@/lib/ky"
import type { TBaseResponse } from "@/types/api"
import "@tanstack/react-start/server-only"
import type {
  TAddTeamMemberPayload,
  TTeamMember,
  TTeamMembersResponse,
  TUpdateTeamMemberRolePayload,
} from "./schemas"

/**
 * @description Lấy danh sách thành viên của team
 */
export async function fetchTeamMembers(params: {
  teamId: string
  q?: string
}): Promise<TTeamMembersResponse> {
  const { teamId, q } = params
  const searchParams = q ? { q } : undefined

  const response = await api
    .get(`teams/${teamId}/members`, { searchParams })
    .json<TBaseResponse<TTeamMembersResponse>>()

  return response.data
}

/**
 * @description Thêm thành viên vào team
 */
export async function addTeamMember(
  teamId: string,
  payload: TAddTeamMemberPayload
): Promise<TTeamMember> {
  const response = await api
    .post(`teams/${teamId}/members`, { json: payload })
    .json<TBaseResponse<TTeamMember>>()

  return response.data
}

/**
 * @description Cập nhật quyền của thành viên trong team
 */
export async function updateTeamMemberRole(
  teamId: string,
  userId: string,
  payload: TUpdateTeamMemberRolePayload
): Promise<TTeamMember> {
  const response = await api
    .patch(`teams/${teamId}/members/${userId}`, { json: payload })
    .json<TBaseResponse<TTeamMember>>()

  return response.data
}

/**
 * @description Xóa thành viên khỏi team
 */
export async function removeTeamMember(
  teamId: string,
  userId: string
): Promise<boolean> {
  const response = await api
    .delete(`teams/${teamId}/members/${userId}`)
    .json<TBaseResponse<boolean>>()
  return response.data
}

/**
 * @description Lấy số lượng project mà member đang tham gia trong team
 */
export async function getMemberProjectCount(
  teamId: string,
  userId: string
): Promise<number> {
  const response = await api
    .get(`teams/${teamId}/members/${userId}/project-count`)
    .json<TBaseResponse<{ count: number }>>()
  return response.data.count
}
