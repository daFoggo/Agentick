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
    // Chúng ta dùng dynamic import để tránh bundle server-only code vào trình duyệt
    const { useAppSession } = await import("./session")
    const session = await useAppSession()
    return session.data.access_token
  } catch (error) {
    return null
  }
}
