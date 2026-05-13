import { cn } from '@/src/lib/utils';

interface ThinkingIndicatorProps {
	className?: string;
}

export default function ThinkingIndicator({ className }: ThinkingIndicatorProps) {
	return (
		<div
			role="status"
			aria-label="AI is thinking"
			className={cn('flex items-center gap-1 py-1', className)}
		>
			{[0, 1, 2].map((i) => (
				<span
					key={i}
					className={cn(
						'typing-dot h-1.5 w-1.5 rounded-full bg-primary/60',
					)}
					style={{ animationDelay: `${i * 0.16}s` }}
					aria-hidden
				/>
			))}
			<span className="sr-only">Thinking…</span>
		</div>
	);
}
