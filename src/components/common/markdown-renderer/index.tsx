import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/lib/error";
import type { MarkdownResult } from "@/lib/markdown";
import { renderMarkdown } from "@/lib/markdown";
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
	const [error, setError] = useState<unknown>(null);

	useEffect(() => {
		const render = async () => {
			setIsLoading(true);
			setError(null);
			try {
				const rendered = await renderMarkdown(content);
				setResult(rendered);
			} catch (error) {
				console.error("Failed to render markdown:", error);
				setError(error);
				setResult(null);
			} finally {
				setIsLoading(false);
			}
		};

		render();
	}, [content]);

	if (isLoading) {
		return (
			<div className={cn("flex flex-col gap-4", className)}>
				<Skeleton className="h-4 w-3/4" />
				<Skeleton className="h-4 w-full" />
				<Skeleton className="h-4 w-5/6" />
			</div>
		);
	}

	if (error) {
		return (
			<Alert variant="destructive" className={className}>
				<AlertTitle>Error rendering content</AlertTitle>
				<AlertDescription>
					{getErrorMessage(error, "Failed to render markdown content.")}
				</AlertDescription>
			</Alert>
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
