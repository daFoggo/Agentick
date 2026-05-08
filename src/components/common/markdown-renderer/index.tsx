import { useEffect, useState } from "react";
import { type MarkdownResult, renderMarkdown } from "@/lib/markdown";
import { cn } from "@/lib/utils";

interface IMarkdownRendererProps {
	content: string;
	className?: string;
	showTOC?: boolean;
	renderHeader?: (headings: MarkdownResult["headings"]) => React.ReactNode;
}

/**
 * Component chuyên dụng để hiển thị nội dung Markdown.
 * Tự động chuyển đổi Markdown thành HTML an toàn, trích xuất Headings
 * và hỗ trợ render interface tùy chỉnh (như Table of Contents).
 */
export const MarkdownRenderer = ({
	content,
	className,
	renderHeader,
}: IMarkdownRendererProps) => {
	const [result, setResult] = useState<MarkdownResult | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const render = async () => {
			setIsLoading(true);
			try {
				const rendered = await renderMarkdown(content);
				setResult(rendered);
			} catch (error) {
				console.error("Failed to render markdown:", error);
			} finally {
				setIsLoading(false);
			}
		};

		render();
	}, [content]);

	if (isLoading) {
		return (
			<div className={cn("animate-pulse space-y-4", className)}>
				<div className="h-4 w-3/4 rounded bg-muted"></div>
				<div className="h-4 w-full rounded bg-muted"></div>
				<div className="h-4 w-5/6 rounded bg-muted"></div>
			</div>
		);
	}

	if (!result) return null;

	return (
		<div className={cn("flex flex-col gap-6", className)}>
			{renderHeader?.(result.headings)}
			<div
				className="prose prose-sm dark:prose-invert max-w-none"
				dangerouslySetInnerHTML={{ __html: result.markup }}
			/>
		</div>
	);
};
