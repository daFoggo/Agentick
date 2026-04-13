import { createServerFn } from "@tanstack/react-start"
import { requestLoggerMiddleware } from "@/lib/middleware"
import {
  fetchTeams,
  fetchTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
} from "./server"
import { 
  GetTeamsSchema, 
  FetchTeamByIdSchema, 
  CreateTeamSchema, 
  UpdateTeamInputSchema 
} from "./schemas"

export const fetchTeamsFn = createServerFn({ method: "GET" })
  .middleware([requestLoggerMiddleware])
  .inputValidator(GetTeamsSchema)
  .handler(({ data }) => fetchTeams(data))

export const fetchTeamByIdFn = createServerFn({ method: "GET" })
  .middleware([requestLoggerMiddleware])
  .inputValidator(FetchTeamByIdSchema)
  .handler(({ data: team_id }) => fetchTeamById(team_id))

export const createTeamFn = createServerFn({ method: "POST" })
  .middleware([requestLoggerMiddleware])
  .inputValidator(CreateTeamSchema)
  .handler(({ data }) => createTeam(data))

export const updateTeamFn = createServerFn({ method: "POST" })
  .middleware([requestLoggerMiddleware])
  .inputValidator(UpdateTeamInputSchema)
  .handler(({ data }) => updateTeam(data.team_id, data.payload))

export const deleteTeamFn = createServerFn({ method: "POST" })
  .middleware([requestLoggerMiddleware])
  .inputValidator(FetchTeamByIdSchema)
  .handler(({ data: team_id }) => deleteTeam(team_id))
