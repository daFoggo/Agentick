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

let tokenCache: { value: string | null; updatedAt: number } = {
  value: null,
  updatedAt: 0,
}
let refreshPromise: Promise<string | null> | null = null

const TOKEN_CACHE_TTL_MS = 5000
const ACCESS_REFRESH_SKEW_MS = 2 * 60 * 1000

function getCachedToken() {
  if (typeof window === "undefined") return null
  if (Date.now() - tokenCache.updatedAt > TOKEN_CACHE_TTL_MS) return null
  return tokenCache.value
}

function setCachedToken(token: string | null) {
  tokenCache = {
    value: token,
    updatedAt: Date.now(),
  }
}

function parseExpirationMs(rawValue: string | null): number | null {
  if (!rawValue) return null

  const parsed = Date.parse(rawValue)
  if (!Number.isNaN(parsed)) {
    return parsed
  }

  const maybeUnixSeconds = Number(rawValue)
  if (Number.isNaN(maybeUnixSeconds)) {
    return null
  }

  return maybeUnixSeconds > 1e12 ? maybeUnixSeconds : maybeUnixSeconds * 1000
}

function isAccessTokenNearExpiry() {
  if (typeof window === "undefined") return false

  const expirationMs = parseExpirationMs(localStorage.getItem("expiration"))
  if (!expirationMs) return false

  return expirationMs - Date.now() <= ACCESS_REFRESH_SKEW_MS
}

function isRefreshTokenStillValid() {
  if (typeof window === "undefined") return true

  const refreshExpirationMs = parseExpirationMs(
    localStorage.getItem("refresh_expiration")
  )
  if (!refreshExpirationMs) return true

  return refreshExpirationMs > Date.now()
}

export async function getAuthToken() {
  const cachedToken = getCachedToken()
  if (cachedToken !== null) {
    return cachedToken
  }

  try {
    const token = await getServerToken()
    setCachedToken(token ?? null)
    return token ?? null
  } catch (error) {
    return null
  }
}

export async function refreshAuthToken(options?: { clearOnFailure?: boolean }) {
  const clearOnFailure = options?.clearOnFailure ?? true

  if (refreshPromise) {
    return refreshPromise
  }

  refreshPromise = (async () => {
    try {
      const { refreshSessionFn } = await import("@/features/auth/functions")
      const response = await refreshSessionFn()
      setCachedToken(response.access_token)

      if (typeof window !== "undefined") {
        localStorage.setItem("expiration", response.expiration)
        localStorage.setItem("refresh_expiration", response.refresh_expiration)
      }

      return response.access_token
    } catch (error) {
      if (clearOnFailure) {
        await deleteAuthToken()
      }
      return null
    } finally {
      refreshPromise = null
    }
  })()

  return refreshPromise
}

export async function getAuthTokenForRequest() {
  if (typeof window !== "undefined" && isAccessTokenNearExpiry()) {
    if (!isRefreshTokenStillValid()) {
      await deleteAuthToken()
      return null
    }

    const refreshedToken = await refreshAuthToken({ clearOnFailure: false })
    if (refreshedToken) {
      return refreshedToken
    }
  }

  return getAuthToken()
}

/**
 * @description Xóa auth token khi logout hoặc token hết hạn (401).
 */
export async function deleteAuthToken() {
  setCachedToken(null)

  if (typeof window !== "undefined") {
    localStorage.removeItem("expiration")
    localStorage.removeItem("refresh_expiration")
    // Cleanup dữ liệu cũ để tương thích ngược nếu máy người dùng còn key cũ.
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
