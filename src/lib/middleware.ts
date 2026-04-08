import { createMiddleware } from "@tanstack/react-start"

/**
 * @description Middleware giúp theo dõi (observability) các Server Functions.
 * Giúp giải quyết vấn đề network request bị mã hóa trong TanStack Start.
 */
export const requestLoggerMiddleware = createMiddleware().server(
  async ({ request, next }) => {
    const startTime = Date.now()
    const url = new URL(request.url)

    // Chỉ chạy log ở môi trường development để tránh spam log production
    if (process.env.NODE_ENV === "development") {
      console.log(`[SERVER-FN] 🚀 START: ${request.method} ${url.pathname}`)
    }

    try {
      const result = await next()
      const duration = Date.now() - startTime

      const status = result?.response?.status ?? "OK";
      if (process.env.NODE_ENV === "development") {
        console.log(
          `[SERVER-FN] ✅ DONE: ${request.method} ${url.pathname} - Status: ${status} (${duration}ms)`
        )
      }

      return result
    } catch (error) {
      const duration = Date.now() - startTime
      console.error(
        `[SERVER-FN] ❌ ERROR: ${url.pathname} after ${duration}ms:`,
        error
      )
      throw error
    }
  }
)
