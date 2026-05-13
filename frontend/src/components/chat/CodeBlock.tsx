'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface CodeBlockProps {
	code: string;
	lang?: string;
	className?: string;
}

export default function CodeBlock({ code, lang, className }: CodeBlockProps) {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		await navigator.clipboard.writeText(code);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const displayLang = lang && lang !== 'text' ? lang : null;

	return (
		<div
			className={cn(
				'group relative my-3 overflow-hidden rounded-xl',
				'border border-white/[0.06]',
				'bg-[#0d1117]',
				className,
			)}
		>
			{/* Top bar */}
			<div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06]">
				<span className="text-xs font-mono text-white/40 lowercase tracking-wide">
					{displayLang ?? 'code'}
				</span>
				<button
					onClick={handleCopy}
					aria-label={copied ? 'Copied!' : 'Copy code'}
					className={cn(
						'flex items-center gap-1.5 rounded-md px-2 py-1',
						'text-xs font-medium transition-all duration-150',
						copied
							? 'text-primary bg-primary/10'
							: 'text-white/40 hover:text-white/70 hover:bg-white/5',
					)}
				>
					{copied ? (
						<>
							<Check className="h-3 w-3" />
							<span>Copied</span>
						</>
					) : (
						<>
							<Copy className="h-3 w-3" />
							<span>Copy</span>
						</>
					)}
				</button>
			</div>

			{/* Code content */}
			<pre
				className={cn(
					'overflow-x-auto px-4 py-4',
					'text-[13px] leading-relaxed font-mono',
					'text-[#e6edf3]',
					'scrollbar-thin',
				)}
			>
				<code>{code}</code>
			</pre>
		</div>
	);
}
