'use client';

import { cn } from '@/src/lib/utils';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface HomeNavbarProps {
	className?: string;
}

const HomeNavbar = ({ className }: HomeNavbarProps) => {
	return (
		<motion.header
			initial={{ opacity: 0, y: -4 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
			className={cn(
				'flex h-12 items-center justify-between px-4',
				'bg-background/80 backdrop-blur-xl',
				'border-b border-border',
				className,
			)}
		>
			{/* Left: toggle + wordmark */}
			<div className="flex items-center gap-2.5">
				<div className="flex items-center gap-2">
					<span className="text-sm font-semibold tracking-tight text-foreground">
						Asynx
					</span>
					<span className="hidden sm:inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
						<Sparkles className="h-2.5 w-2.5" />
						Intelligence
					</span>
				</div>
			</div>
		</motion.header>
	);
};

export default HomeNavbar;
