import { createServerFn } from "@tanstack/react-start"

const getServerToken = createServerFn({ method: "GET" }).handler(async () => {
  const { useAppSession } = await import("./session.server")
  const session = await useAppSession()
  return session.data.access_token
})

const clearServerSession = createServerFn({ method: "POST" }).handler(
  async () => {
    const { useAppSession } = await import("./session.server")
    const session = await useAppSession()
    await session.clear()
  }
)

export async function getAuthToken() {
  // Client-side: Lấy từ localStorage
  if (typeof window !== "undefined") {
    return localStorage.getItem("access_token")
  }

  // Server-side: Lấy thông qua server function (nếu chạy trên server nó sẽ chạy code handler trực tiếp)
  try {
    return await getServerToken()
  } catch (error) {
    return null
  }
}

/**
 * @description Xóa auth token khi logout hoặc token hết hạn (401).
 */
export async function deleteAuthToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
  }

  // Luôn cố gắng xóa session ở server để đảm bảo an toàn
  try {
    await clearServerSession()
  } catch (error) {
    console.error("Failed to clear session on server", error)
  }
}
