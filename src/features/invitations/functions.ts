import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"
import { requestLoggerMiddleware } from "@/lib/middleware"
import {
  fetchMyInvitations,
  fetchInvitationById,
  acceptInvitation,
  declineInvitation,
} from "./server"

export const getMyInvitationsFn = createServerFn({ method: "GET" })
  .middleware([requestLoggerMiddleware])
  .handler(async () => {
    return await fetchMyInvitations()
  })

export const getInvitationByIdFn = createServerFn({ method: "GET" })
  .middleware([requestLoggerMiddleware])
  .inputValidator(z.object({ invitationId: z.string() }))
  .handler(async ({ data }) => {
    return await fetchInvitationById(data.invitationId)
  })

export const acceptInvitationFn = createServerFn({ method: "POST" })
  .middleware([requestLoggerMiddleware])
  .inputValidator(z.object({ invitationId: z.string() }))
  .handler(async ({ data }) => {
    return await acceptInvitation(data.invitationId)
  })

export const declineInvitationFn = createServerFn({ method: "POST" })
  .middleware([requestLoggerMiddleware])
  .inputValidator(z.object({ invitationId: z.string() }))
  .handler(async ({ data }) => {
    return await declineInvitation(data.invitationId)
  })
