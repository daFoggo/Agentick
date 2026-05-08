import { QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { queryClient } from "@/lib/query-client";

/**
 * Wrapper component cung cấp QueryClient cho toàn bộ ứng dụng.
 * Cho phép các components bên trong sử dụng các hooks của React Query để quản lý server state.
 */
export function QueryProvider({ children }: { children: ReactNode }) {
	return (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);
}
