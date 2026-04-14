import ky, { type Options } from "ky"
import { API_ENDPOINTS } from "@/configs/env"

const AUTH_RETRY_HEADER = "x-auth-retry"

/**
 * @description Cấu hình cơ sở cho Ky.
 */
const baseOptions: Options = {
  timeout: 30000,
  hooks: {
    beforeRequest: [
      async ({ request }) => {
        const { getAuthTokenForRequest } = await import("./auth-token")
        const token = await getAuthTokenForRequest()
        if (token) {
          request.headers.set("Authorization", `Bearer ${token}`)
        }
      },
    ],
    afterResponse: [
      async ({ request, options, response }) => {
        if (response.status !== 401) {
          return response
        }

        const alreadyRetried = request.headers.get(AUTH_RETRY_HEADER) === "1"
        const isOnAuthPage =
          typeof window !== "undefined" &&
          window.location.pathname.startsWith("/auth/")

        if (!alreadyRetried && !isOnAuthPage) {
          const { refreshAuthToken } = await import("./auth-token")
          const nextToken = await refreshAuthToken()

          if (nextToken) {
            const retryHeaders = new Headers(request.headers)
            retryHeaders.set("Authorization", `Bearer ${nextToken}`)
            retryHeaders.set(AUTH_RETRY_HEADER, "1")

            return ky(request, {
              ...options,
              headers: retryHeaders,
            })
          }
        }

        const { deleteAuthToken } = await import("./auth-token")
        await deleteAuthToken()

        if (typeof window !== "undefined") {
          const { redirect } = await import("@tanstack/react-router")
          throw redirect({
            to: "/auth/sign-in",
            search: {
              redirect: window.location.href,
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
