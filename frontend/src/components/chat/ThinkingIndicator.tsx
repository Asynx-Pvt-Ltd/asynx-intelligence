import { cn } from '@/src/lib/utils';

interface ThinkingIndicatorProps {
	className?: string;
}

export default function ThinkingIndicator({
	className,
}: ThinkingIndicatorProps) {
	return (
		<div
			role="status"
			aria-label="Generating response"
			className={cn('flex items-center gap-1.5', className)}
		>
			{[0, 1, 2].map((i) => (
				<span
					key={i}
					className="typing-dot h-1.5 w-1.5 rounded-full bg-muted-foreground/40"
					style={{ animationDelay: `${i * 0.18}s` }}
					aria-hidden
				/>
			))}
		</div>
	);
}
