import React from 'react';
import { cn } from '@/src/lib/utils';

const StarterChatWrapper = ({ children }: { children: React.ReactNode }) => {
	return (
		<div
			className={cn(
				'relative flex min-h-full flex-col items-center justify-center px-4 py-12',
				'bg-mesh',
			)}
		>
			{/* Subtle noise / depth layer */}
			<div
				className="pointer-events-none absolute inset-0 opacity-[0.018]"
				style={{
					backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
					backgroundRepeat: 'repeat',
					backgroundSize: '128px 128px',
				}}
				aria-hidden
			/>
			<div className="relative z-10 w-full">{children}</div>
		</div>
	);
};

export default StarterChatWrapper;
