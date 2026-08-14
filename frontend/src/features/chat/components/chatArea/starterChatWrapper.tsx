import React from 'react';
import { cn } from '@/src/lib/utils';

const StarterChatWrapper = ({ children }: { children: React.ReactNode }) => {
	return (
		<div
			className={cn(
				'relative flex min-h-full flex-col items-center justify-center px-4 py-12',
				'bg-background',
			)}
		>
			{/* Subtle dot grid */}
			<div
				className="pointer-events-none absolute inset-0 opacity-[0.4] dark:opacity-[0.15]"
				style={{
					backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
					backgroundSize: '24px 24px',
					color: 'var(--border)',
				}}
				aria-hidden
			/>
			<div className="relative z-10 w-full">{children}</div>
		</div>
	);
};

export default StarterChatWrapper;
