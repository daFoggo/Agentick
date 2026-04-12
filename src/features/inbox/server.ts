import '@tanstack/react-start/server-only'

import type { GetInboxStatsInput, TInboxStats } from "./schemas"

export async function fetchInboxStats(_params: GetInboxStatsInput): Promise<TInboxStats> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  return {
    activeCount: 12,
    bookmarksCount: 5,
    archiveCount: 3,
  }
}
