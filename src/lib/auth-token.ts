/**
 * @description Utility to get the auth token isomorphically (works on client and server).
 */

export async function getAuthToken() {
  // Client-side: Lấy từ localStorage
  if (typeof window !== "undefined") {
    return localStorage.getItem("access_token")
  }

  // Server-side: Lấy từ TanStack Session thông qua cookie
  try {
    const { useAppSession } = await import("./session")
    const session = await useAppSession()
    return session.data.access_token
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
  } else {
    try {
      const { useAppSession } = await import("./session")
      const session = await useAppSession()
      await session.clear()
    } catch (error) {
      console.error("Failed to clear session on server", error)
    }
  }
}
