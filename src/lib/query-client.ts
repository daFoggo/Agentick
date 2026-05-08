import { QueryClient } from "@tanstack/react-query";

/**
 * Instance duy nhất (singleton) của QueryClient được sử dụng xuyên suốt ứng dụng
 * để quản lý và đồng bộ hóa trạng thái dữ liệu từ API (Server State).
 */
export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 1000 * 60 * 5, // Dữ liệu được coi là mới trong 5 phút
			gcTime: 1000 * 60 * 10, // Cache được giữ lại trong bộ nhớ 10 phút sau khi không sử dụng
		},
	},
});

/**
 * Hàm tạo (factory) một QueryClient mới.
 * Thường được sử dụng trong các tình huống đặc biệt cần khởi tạo client riêng
 * hoặc trong quá trình SSR (Server Side Rendering).
 */
export const createQueryClient = () =>
	new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 1000 * 60 * 5,
				gcTime: 1000 * 60 * 10,
			},
		},
	});
