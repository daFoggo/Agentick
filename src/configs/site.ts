/**
 * Cấu hình thông tin cơ bản của website như title, description và default metadata.
 * Được sử dụng tập trung cho việc hiển thị page title và hỗ trợ SEO.
 */
export const SITE_CONFIG = {
	metadata: {
		title: "Agentick",
		description: "A project management platform with AI",
	},
	app: {
		title: "Agentick",
	},
} as const;

export type TSiteConfig = typeof SITE_CONFIG;
