import { AppPageHeader } from "@/components/layout/app/page-header"
import { AppSidebar } from "@/components/layout/app/sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { userQueries } from "@/features/users"
import { inboxStatsQueryOptions } from "@/features/inbox/queries"
import { cn } from "@/lib/utils"
import { createFileRoute, Outlet, redirect, useMatches } from "@tanstack/react-router"

export const Route = createFileRoute("/dashboard")({
  beforeLoad: async ({ location }) => {
    const { getAuthToken } = await import("@/lib/auth-token")
    const token = await getAuthToken()
    if (!token) {
      throw redirect({
        to: "/auth/sign-in",
        search: {
          redirect: location.href,
        },
      })
    }
  },
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(userQueries.me()),
      context.queryClient.ensureQueryData(inboxStatsQueryOptions()),
    ])
  },
  component: DashboardLayout,
  staticData: {
    getTitle: () => "Dashboard",
  },
})

function DashboardLayout() {
  const matches = useMatches()
  const isFixedHeight = matches.some((m) => m.staticData?.fixedHeight)

  return (
    <SidebarProvider className="h-svh overflow-hidden">
      <AppSidebar />
      <SidebarInset className={cn("h-full", !isFixedHeight && "overflow-y-auto")}>
        <main
          className={cn(
            "flex flex-col gap-4 p-4",
            isFixedHeight ? "h-full overflow-hidden" : "min-h-full"
          )}
        >
          <AppPageHeader />
          {isFixedHeight ? (
            <div className="flex-1 min-h-0">
              <Outlet />
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
