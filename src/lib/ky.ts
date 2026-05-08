import ky from "ky";
import { API_ENDPOINTS } from "@/configs/env";

/**
 * Instance của thư viện `ky` được cấu hình sẵn cho các yêu cầu đến Backend Core.
 * Tự động xử lý:
 * - Gắn Bearer Token vào header mỗi khi gửi request.
 * - Tự động thử lại (retry) một lần khi gặp lỗi 401 bằng cách gọi API refresh token.
 * - Điều hướng về trang sign-in nếu xác thực thất bại hoàn toàn.
 */
export const api = ky.create({
	timeout: 30000,
	prefix: API_ENDPOINTS.CORE_API_URL,
	hooks: {
		beforeRequest: [
			async ({ request }) => {
				const { getAuthTokenForRequest } = await import("./auth-token");
				const token = await getAuthTokenForRequest();
				if (token) {
					request.headers.set("Authorization", `Bearer ${token}`);
				}
			},
		],
		afterResponse: [
			async ({ request, options, response }) => {
				if (response.status !== 401) {
					return response;
				}

				const alreadyRetried = request.headers.get(AUTH_RETRY_HEADER) === "1";
				const isOnAuthPage =
					typeof window !== "undefined" &&
					window.location.pathname.startsWith("/auth/");

				if (!alreadyRetried && !isOnAuthPage) {
					const { refreshAuthToken } = await import("./auth-token");
					const nextToken = await refreshAuthToken();

					if (nextToken) {
						const retryHeaders = new Headers(request.headers);
						retryHeaders.set("Authorization", `Bearer ${nextToken}`);
						retryHeaders.set(AUTH_RETRY_HEADER, "1");

						return ky(request, {
							...options,
							headers: retryHeaders,
						});
					}
				}

				const { deleteAuthToken } = await import("./auth-token");
				await deleteAuthToken();

				if (typeof window !== "undefined") {
					const { redirect } = await import("@tanstack/react-router");
					throw redirect({
						to: "/auth/sign-in",
						search: {
							redirect: window.location.href,
						},
					});
				}

				return response;
			},
		],
	},
});

/**
 * Instance mở rộng từ `api`, được cấu hình riêng cho Backend AI.
 * Kế thừa toàn bộ logic xác thực, retry và prefix API cơ bản của dự án.
 */
export const aiApi = api.extend({
	prefix: API_ENDPOINTS.AI_API_URL,
});

// --- Internal Constants & Configuration ---

const AUTH_RETRY_HEADER = "x-auth-retry";
