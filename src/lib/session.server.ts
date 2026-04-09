import { useSession } from "@tanstack/react-start/server"

/**
 * @description Định nghĩa cấu trúc dữ liệu Session
 */
type SessionData = {
  access_token?: string
  refresh_token?: string
  userId?: string
}

/**
 * @description Hook server-only để quản lý session bằng HTTP-only cookie.
 */
export function useAppSession() {
  return useSession<SessionData>({
    name: "agentick_session",
    password: process.env.SESSION_SECRET!,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
    },
  })
}
