import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import { Markdown } from "@tiptap/markdown";
import { type Editor, EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import type * as React from "react";
import { useEffect, useRef } from "react";
import { markdownContentClassName } from "@/components/common/markdown-renderer";
import { cn } from "@/lib/utils";

interface IMarkdownEditorProps
	extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
	value: string;
	onChange: (value: string) => void;
	containerClassName?: string;
	editorClassName?: string;
	footer?: React.ReactNode;
	placeholder?: string;
	disabled?: boolean;
	readOnly?: boolean;
	onModEnter?: (value: string) => void;
}

export const MarkdownEditor = ({
	value,
	onChange,
	containerClassName,
	className,
	editorClassName,
	footer,
	placeholder = "Write markdown...",
	disabled,
	readOnly,
	onBlur,
	onModEnter,
	id,
	"aria-invalid": ariaInvalid,
	...props
}: IMarkdownEditorProps) => {
	const editorRef = useRef<Editor | null>(null);
	const lastMarkdownRef = useRef(value);

	const editor = useEditor({
		extensions: [
			StarterKit,
			Link.configure({
				openOnClick: false,
				autolink: true,
				defaultProtocol: "https",
			}),
			Typography,
			Placeholder.configure({
				placeholder,
			}),
			Markdown.configure({
				markedOptions: {
					gfm: true,
					breaks: false,
				},
			}),
		],
		content: value || "",
		contentType: "markdown",
		editable: !disabled && !readOnly,
		immediatelyRender: false,
		editorProps: {
			attributes: {
				id: id ?? "",
				"aria-invalid": ariaInvalid ? "true" : "false",
				class: cn(
					markdownContentClassName,
					"min-h-32 px-3 py-2 outline-none",
					"[&_.is-empty:first-child::before]:pointer-events-none [&_.is-empty:first-child::before]:float-left [&_.is-empty:first-child::before]:h-0 [&_.is-empty:first-child::before]:text-muted-foreground [&_.is-empty:first-child::before]:content-[attr(data-placeholder)]",
					disabled || readOnly ? "cursor-not-allowed opacity-60" : "",
					className,
					editorClassName,
				),
			},
			handleDOMEvents: {
				blur: (_view, event) => {
					onBlur?.(event as unknown as React.FocusEvent<HTMLDivElement>);
					return false;
				},
			},
			handleKeyDown: (_view, event) => {
				if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
					const markdown = editorRef.current?.getMarkdown() ?? value;
					onModEnter?.(markdown);
					return !!onModEnter;
				}

				return false;
			},
		},
		onUpdate: ({ editor }) => {
			const markdown = editor.getMarkdown();
			lastMarkdownRef.current = markdown;
			onChange(markdown);
		},
	});

	useEffect(() => {
		editorRef.current = editor;
	}, [editor]);

	useEffect(() => {
		editor?.setEditable(!disabled && !readOnly);
	}, [disabled, editor, readOnly]);

	useEffect(() => {
		if (!editor) return;
		if (value === lastMarkdownRef.current) return;

		lastMarkdownRef.current = value;
		editor.commands.setContent(value || "", {
			contentType: "markdown",
			emitUpdate: false,
		});
	}, [editor, value]);

	return (
		<div
			className={cn(
				"overflow-hidden rounded-lg border border-input bg-transparent transition-colors focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/50 has-[[aria-invalid=true]]:border-destructive has-[[aria-invalid=true]]:ring-2 has-[[aria-invalid=true]]:ring-destructive/20 dark:bg-input/30 dark:has-[[aria-invalid=true]]:ring-destructive/40",
				containerClassName,
			)}
			{...props}
		>
			<EditorContent editor={editor} />
			{footer ? <div className="border-t px-3 py-2">{footer}</div> : null}
		</div>
	);
};
