import { TanStackDevtools } from "@tanstack/react-devtools";
import {
	createRootRouteWithContext,
	HeadContent,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { ErrorFallback, NotFound } from "@/components/common/error-pages";
import { QueryProvider } from "@/components/common/query-provider";
import { ThemeProvider } from "@/components/common/theme-provider";
import { ToasterProvider } from "@/components/common/toaster-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SITE_CONFIG } from "@/configs/site";
import { getThemeServerFn } from "@/lib/theme";
import type { IRouterContext } from "@/router";
import appCss from "../styles.css?url";

export const Route = createRootRouteWithContext<IRouterContext>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: SITE_CONFIG.metadata.title,
			},
			{
				name: "description",
				content: SITE_CONFIG.metadata.description,
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),
	loader: () => getThemeServerFn(),
	shellComponent: RootDocument,
	notFoundComponent: NotFound,
	errorComponent: ErrorFallback,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	const theme = Route.useLoaderData();
	return (
		<html lang="en" className={theme} suppressHydrationWarning>
			<head>
				<HeadContent />
			</head>
			<body suppressHydrationWarning>
				<QueryProvider>
					<ThemeProvider theme={theme}>
						<TooltipProvider>{children}</TooltipProvider>
						<ToasterProvider />
					</ThemeProvider>
				</QueryProvider>
				<TanStackDevtools
					config={{
						position: "bottom-right",
					}}
					plugins={[
						{
							name: "Tanstack Router",
							render: <TanStackRouterDevtoolsPanel />,
						},
					]}
				/>
				<Scripts />
			</body>
		</html>
	);
}
