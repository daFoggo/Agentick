import { PageHeader } from "@/components/layout/app/page-header"
import { AppSidebar } from "@/components/layout/app/sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { userQueries } from "@/features/users"
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"

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
    await context.queryClient.ensureQueryData(userQueries.me())
  },
  component: DashboardLayout,
  staticData: {
    getTitle: () => "Dashboard",
  },
})

function DashboardLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <main className="flex flex-col flex-1 gap-4 p-4">
          <PageHeader />
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
