import "@tanstack/react-start/server-only"
import { api } from "@/lib/ky"
import type { TBaseResponse } from "@/types/api"
import type { TTeamMember, TTeamRole } from "./schemas"

/**
 * @description Lấy danh sách thành viên của team
 */
export async function fetchTeamMembers(teamId: string): Promise<TTeamMember[]> {
  const response = await api
    .get(`teams/${teamId}/members`)
    .json<TBaseResponse<TTeamMember[]>>()
  return response.data
}

/**
 * @description Thêm thành viên vào team
 */
export async function addTeamMember(
  teamId: string,
  userId: string,
  role: TTeamRole
): Promise<TTeamMember> {
  const payload = {
    user_id: userId,
    role,
  }
  const response = await api
    .post(`teams/${teamId}/members`, { json: payload })
    .json<TBaseResponse<TTeamMember>>()
  return response.data
}

/**
 * @description Cập nhật Role của thành viên
 */
export async function updateTeamMemberRole(
  teamId: string,
  userId: string,
  role: TTeamRole
): Promise<TTeamMember> {
  const payload = {
    role,
  }
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
): Promise<void> {
  await api
    .delete(`teams/${teamId}/members/${userId}`)
    .json<TBaseResponse<void>>()
}
