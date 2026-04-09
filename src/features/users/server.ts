import { api } from "@/lib/ky"
import type { TBaseResponse } from "@/types/api"
import "@tanstack/react-start/server-only"
import type { TUser } from "./schemas"

/**
 * @description Lấy thông tin người dùng hiện tại
 */
export async function getUserMe(): Promise<TUser> {
  const response = await api.get("users/me").json<TBaseResponse<TUser>>()
  return response.data
}
