import { api } from "@/lib/ky"
import type { TBaseResponse } from "@/types/api"
import "@tanstack/react-start/server-only"
import type { TUser, TUserSearchResult } from "./schemas"

/**
 * @description Lấy thông tin người dùng hiện tại
 */
export async function getUserMe(): Promise<TUser> {
  const response = await api.get("users/me").json<TBaseResponse<TUser>>()
  return response.data
}

/**
 * @description Search users by email or name
 */
export async function searchUsers(params: {
  q: string
  limit?: number
  team_id?: string
}): Promise<TUserSearchResult[]> {
  const searchParams = new URLSearchParams({ q: params.q })
  if (params.limit) searchParams.set("limit", String(params.limit))
  if (params.team_id) searchParams.set("team_id", params.team_id)

  const response = await api
    .get(`users/search?${searchParams.toString()}`)
    .json<TBaseResponse<TUserSearchResult[]>>()
  return response.data
}
