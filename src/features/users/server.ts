import { api } from "@/lib/ky"
import type { TBaseResponse } from "@/types/api"
import "@tanstack/react-start/server-only"
import { z } from "zod"
import { SearchUsersInputSchema, type TUser, type TUserSearchResult } from "./schemas"

/**
 * @description Lấy thông tin người dùng hiện tại
 */
export async function getUserMe(): Promise<TUser> {
  const response = await api.get("users/me").json<TBaseResponse<TUser>>()
  return response.data
}

/**
 * @description Search users by email or name with advanced exclusion filters
 */
export async function searchUsers(
  params: z.infer<typeof SearchUsersInputSchema>
): Promise<TUserSearchResult[]> {
  const searchParams: Record<string, string | number> = {
    q: params.q,
  }

  if (params.limit) {
    searchParams.limit = params.limit
  }

  if (params.teamId) {
    searchParams.team_id = params.teamId
  }

  if (params.excludeTeamId) {
    searchParams.exclude_team_id = params.excludeTeamId
  }

  if (params.excludeProjectId) {
    searchParams.exclude_project_id = params.excludeProjectId
  }

  const response = await api
    .get("users/search", { searchParams })
    .json<TBaseResponse<TUserSearchResult[]>>()

  return response.data
}
