'use client';

import { cn } from '@/src/lib/utils';
import { useRouter } from 'next/navigation';

interface LogoProps {
	className?: string;
	imageStyles?: string;
	enableRedirect?: boolean;
}

export default function Logo({ className, enableRedirect = false }: LogoProps) {
	const router = useRouter();

	return (
		<div
			className={cn('flex items-center justify-center', className)}
			onClick={() => {
				if (enableRedirect) router.push('/');
			}}
			role={enableRedirect ? 'button' : undefined}
			style={enableRedirect ? { cursor: 'pointer' } : undefined}
		>
			<svg
				viewBox="0 0 24 24"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				className="w-full h-full"
				aria-label="Aria"
			>
				{/* A-frame legs */}
				<path
					d="M4.5 20L12 4L19.5 20"
					stroke="#6366f1"
					strokeWidth="2.1"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				{/* Crossbar */}
				<path
					d="M7.5 13.5H16.5"
					stroke="#6366f1"
					strokeWidth="2.1"
					strokeLinecap="round"
				/>
			</svg>
		</div>
	);
}
