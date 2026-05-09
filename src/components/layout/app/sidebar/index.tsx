import { useQuery } from "@tanstack/react-query";
import { useLocation } from "@tanstack/react-router";
import { Suspense, useEffect } from "react";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
	SIDEBAR_PERSONAL,
	SIDEBAR_PROJECT_SETTINGS,
	SIDEBAR_TEAM,
} from "@/constants/sidebar-navigation";
import { inboxStatsQueryOptions } from "@/features/inbox/queries";
import { SidebarProjectList } from "@/features/projects";
import { useSidebarContextStore } from "@/stores/use-sidebar-context-store";
import { HeaderContent } from "./header-content";
import { SidebarGroupSection } from "./sidebar-navigation";
import { TeamSwitcher } from "./team-switcher";
import { ThemeToggleWrapper } from "./theme-toggle-wrapper";
import { UserProfile } from "./user-profile";

/**
 * Thành phần Sidebar chính của ứng dụng Dashboard.
 * Quản lý Navigation, chuyển đổi Workspace (Team Switcher), danh sách Projects và thông tin User.
 */
export const AppSidebar = () => {
	const { pathname } = useLocation();
	const activeContextId = useSidebarContextStore(
		(state) => state.activeContextId,
	);
	const routeParams = useSidebarContextStore((state) => state.routeParams);
	const syncWithPathname = useSidebarContextStore(
		(state) => state.syncWithPathname,
	);

	const { data: inboxStats } = useQuery(inboxStatsQueryOptions());
	const unreadCount = inboxStats?.unread_count ?? 0;

	useEffect(() => {
		syncWithPathname(pathname);
	}, [pathname, syncWithPathname]);

	const isProjectSettingsContext = activeContextId === "project-settings";

	const personalNavigation = {
		...SIDEBAR_PERSONAL,
		items: SIDEBAR_PERSONAL.items.map((item) => {
			if (item.title === "Inbox") {
				return { ...item, badge: unreadCount };
			}
			return item;
		}),
	};

	return (
		<Sidebar variant="inset">
			<SidebarHeader>
				<HeaderContent />
			</SidebarHeader>
			<SidebarContent>
				{/* Tiện ích Header */}
				<SidebarGroup>
					<SidebarMenu>
						<TeamSwitcher />
					</SidebarMenu>
				</SidebarGroup>

				{isProjectSettingsContext ? (
					<SidebarGroupSection
						group={SIDEBAR_PROJECT_SETTINGS}
						params={routeParams}
					/>
				) : (
					<>
						<SidebarGroupSection group={personalNavigation} />

						<SidebarProjectList />

						<SidebarGroupSection group={SIDEBAR_TEAM} />
					</>
				)}

				{/* Tiện ích Footer */}
				<SidebarGroup className="mt-auto">
					<SidebarMenu>
						<ThemeToggleWrapper />
					</SidebarMenu>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter>
				<SidebarMenu>
					<Suspense
						fallback={
							<SidebarMenuItem>
								<SidebarMenuButton disabled>
									<div className="flex items-center gap-2">
										<div className="size-8 animate-pulse rounded-full bg-muted" />
										<div className="flex flex-col gap-1">
											<div className="h-3 w-20 animate-pulse rounded bg-muted" />
											<div className="h-2 w-24 animate-pulse rounded bg-muted" />
										</div>
									</div>
								</SidebarMenuButton>
							</SidebarMenuItem>
						}
					>
						<UserProfile />
					</Suspense>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
};
