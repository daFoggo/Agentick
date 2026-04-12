import { z } from "zod"

export const GetInboxStatsSchema = z.object({})

export type GetInboxStatsInput = z.infer<typeof GetInboxStatsSchema>

export type TInboxStats = {
  activeCount: number
  bookmarksCount: number
  archiveCount: number
}
