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
          // Tránh redirect vô hạn nếu đang ở trang auth
          if (typeof window !== "undefined" && window.location.pathname.startsWith("/auth/")) {
            return response
          }
          console.warn("Unauthorized access - redirecting to login")
          const { deleteAuthToken } = await import("./auth-token")
          await deleteAuthToken()

          const { redirect } = await import("@tanstack/react-router")
          throw redirect({
            to: "/auth/sign-in",
            search: {
              // Có thể thêm redirect back sau khi login thành công
              redirect: typeof window !== "undefined" ? window.location.href : undefined,
            },
          })
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
