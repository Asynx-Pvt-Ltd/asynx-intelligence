'use client';

import { cn } from '@/src/lib/utils';

interface HomeNavbarProps {
	className?: string;
}

const HomeNavbar = ({ className }: HomeNavbarProps) => {
	return (
		<header
			className={cn(
				'flex h-12 items-center justify-between px-4',
				'border-b border-border bg-background',
				className,
			)}
		>
			<span className="text-sm font-semibold tracking-tight text-foreground">
				Aria
			</span>

			<p className="text-[11px] text-muted-foreground/40">
				An Asynx Engineering product
			</p>
		</header>
	);
};

export default HomeNavbar;
