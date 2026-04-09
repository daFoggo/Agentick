import ky, { type Options } from "ky"
import { API_ENDPOINTS } from "@/configs/env"

/**
 * @description Cấu hình cơ sở cho Ky.
 */
const baseOptions: Options = {
  timeout: 30000,
  hooks: {
    beforeRequest: [
      async ({ request }) => {
        const { getAuthToken } = await import("./auth-token")
        const token = await getAuthToken()
        if (token) {
          request.headers.set("Authorization", `Bearer ${token}`)
        }
      },
    ],
    afterResponse: [
      async ({ response }) => {
        // Xử lý lỗi tập trung (ví dụ 401 Unauthorized)
        if (response.status === 401) {
          console.warn("Unauthorized access - potential token expiry")
        }
        return response
      },
    ],
  },
}

/**
 * @description Instance dùng cho Backend Core
 * Sử dụng CORE_API (đã có hậu tố /api) để fetch dữ liệu
 */
export const api = ky.create({
  ...baseOptions,
  prefix: API_ENDPOINTS.CORE_API_URL,
})

/**
 * @description Instance dùng cho Backend AI
 * Sử dụng AI_API (đã có hậu tố /api) để fetch dữ liệu
 */
export const aiApi = api.extend({
  prefix: API_ENDPOINTS.AI_API_URL,
})
