'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import Logo from '@/src/components/ui/logo';
import MarkdownRenderer from '@/src/components/chat/MarkdownRenderer';
import ThinkingIndicator from '@/src/components/chat/ThinkingIndicator';

interface AssistantMessageProps {
	content: string;
	isStreaming?: boolean;
}

function CopyButton({ text }: { text: string }) {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(text);
			setCopied(true);
			setTimeout(() => setCopied(false), 1500);
		} catch {
			/* ignore */
		}
	};

	return (
		<button
			type="button"
			onClick={handleCopy}
			aria-label={copied ? 'Copied' : 'Copy response'}
			className={cn(
				'inline-flex h-7 w-7 items-center justify-center rounded-md',
				'text-muted-foreground/60 transition-colors duration-100',
				'hover:bg-muted hover:text-foreground',
			)}
		>
			{copied ? (
				<Check className="h-3.5 w-3.5 text-primary" />
			) : (
				<Copy className="h-3.5 w-3.5" />
			)}
		</button>
	);
}

export default function AssistantMessage({
	content,
	isStreaming = false,
}: AssistantMessageProps) {
	const showContent = content.trim().length > 0;

	return (
		<div className="flex gap-3 py-4 group/msg animate-fade-up">
			<div className="shrink-0 pt-0.5">
				<Logo className="relative border border-border w-7 h-7 rounded-full p-1 bg-card" />
			</div>

			<div className="flex-1 min-w-0 space-y-3">
				{showContent ? (
					<MarkdownRenderer content={content} isStreaming={isStreaming} />
				) : (
					isStreaming && <ThinkingIndicator />
				)}

				{!isStreaming && showContent && (
					<div
						className={cn(
							'flex items-center gap-1 -ml-1',
							'opacity-0 group-hover/msg:opacity-100 transition-opacity duration-150',
						)}
					>
						<CopyButton text={content} />
					</div>
				)}
			</div>
		</div>
	);
}
