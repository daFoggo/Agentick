import { queryOptions } from "@tanstack/react-query";
import { getInboxListFn, getInboxStatsFn } from "./functions";
import type {
	GetInboxStatsInput,
	TInboxItem,
	TInboxStats,
	TInboxStatus,
} from "./schemas";

export const inboxKeys = {
	all: ["inbox"] as const,
	stats: () => [...inboxKeys.all, "stats"] as const,
	list: (status?: TInboxStatus, isRead?: boolean, isBookmarked?: boolean) =>
		[...inboxKeys.all, "list", status, isRead, isBookmarked] as const,
};

export const inboxStatsQueryOptions = (params: GetInboxStatsInput = {}) =>
	queryOptions({
		queryKey: inboxKeys.stats(),
		queryFn: () => getInboxStatsFn({ data: params }) as Promise<TInboxStats>,
		staleTime: 1000 * 60 * 2, // 2 minutes
		refetchInterval: 60000,
	});

export const inboxListQueryOptions = (
	status?: TInboxStatus,
	isRead?: boolean,
	isBookmarked?: boolean,
) =>
	queryOptions({
		queryKey: inboxKeys.list(status, isRead, isBookmarked),
		queryFn: () =>
			getInboxListFn({ data: { status, isRead, isBookmarked } }) as Promise<
				TInboxItem[]
			>,
		staleTime: 1000 * 30, // 30 seconds
		refetchInterval: 60000,
	});
