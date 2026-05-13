'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CodeBlock from './CodeBlock';
import { cn } from '@/src/lib/utils';
import type { Components } from 'react-markdown';

interface MarkdownRendererProps {
	content: string;
	isStreaming?: boolean;
	className?: string;
}

const mdComponents: Components = {
	p({ children }) {
		return (
			<p className="leading-7 [&:not(:first-child)]:mt-4 text-[15px]">
				{children}
			</p>
		);
	},
	h1({ children }) {
		return (
			<h1 className="mt-6 mb-3 text-xl font-semibold tracking-tight text-foreground">
				{children}
			</h1>
		);
	},
	h2({ children }) {
		return (
			<h2 className="mt-5 mb-2.5 text-lg font-semibold tracking-tight text-foreground">
				{children}
			</h2>
		);
	},
	h3({ children }) {
		return (
			<h3 className="mt-4 mb-2 text-base font-semibold text-foreground">
				{children}
			</h3>
		);
	},
	ul({ children }) {
		return (
			<ul className="mt-3 space-y-1.5 pl-5 list-disc marker:text-primary/60">
				{children}
			</ul>
		);
	},
	ol({ children }) {
		return (
			<ol className="mt-3 space-y-1.5 pl-5 list-decimal marker:text-primary/60 marker:font-medium">
				{children}
			</ol>
		);
	},
	li({ children }) {
		return (
			<li className="text-[15px] leading-6 text-foreground/90">
				{children}
			</li>
		);
	},
	strong({ children }) {
		return (
			<strong className="font-semibold text-foreground">{children}</strong>
		);
	},
	em({ children }) {
		return <em className="italic text-foreground/80">{children}</em>;
	},
	blockquote({ children }) {
		return (
			<blockquote className="mt-4 border-l-2 border-primary/50 pl-4 italic text-muted-foreground">
				{children}
			</blockquote>
		);
	},
	hr() {
		return <hr className="my-5 border-border" />;
	},
	a({ href, children }) {
		return (
			<a
				href={href}
				target="_blank"
				rel="noopener noreferrer"
				className="text-primary underline decoration-primary/30 underline-offset-3 hover:decoration-primary transition-colors"
			>
				{children}
			</a>
		);
	},
	table({ children }) {
		return (
			<div className="mt-4 overflow-x-auto rounded-lg border border-border">
				<table className="w-full text-sm">{children}</table>
			</div>
		);
	},
	thead({ children }) {
		return (
			<thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
				{children}
			</thead>
		);
	},
	tr({ children }) {
		return <tr className="border-b border-border last:border-0">{children}</tr>;
	},
	th({ children }) {
		return <th className="px-4 py-2.5 text-left font-medium">{children}</th>;
	},
	td({ children }) {
		return (
			<td className="px-4 py-2.5 text-foreground/80">{children}</td>
		);
	},
	code({ children, className: langClass }) {
		// inline code
		const isInline = !langClass;
		if (isInline) {
			return (
				<code className="rounded-md bg-muted px-1.5 py-0.5 text-[13px] font-mono text-primary/90 border border-border/60">
					{children}
				</code>
			);
		}
		// fenced code block — extract lang from className="language-xxx"
		const lang = langClass?.replace('language-', '');
		return (
			<CodeBlock code={String(children).replace(/\n$/, '')} lang={lang} />
		);
	},
	pre({ children }) {
		// Let code handle its own rendering; pre is just a pass-through here
		return <>{children}</>;
	},
};

export default function MarkdownRenderer({
	content,
	isStreaming = false,
	className,
}: MarkdownRendererProps) {
	return (
		<div
			className={cn(
				'prose-invert max-w-none text-foreground/90',
				className,
			)}
		>
			<ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
				{content}
			</ReactMarkdown>
			{isStreaming && (
				<span
					className="cursor-blink ml-0.5 inline-block"
					aria-hidden="true"
				/>
			)}
		</div>
	);
}
