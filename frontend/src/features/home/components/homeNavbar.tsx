'use client';

import { cn } from '@/src/lib/utils';
import { useChatSidebarStore } from '@/src/stores/chat/chatSidebarStore';
import { motion } from 'framer-motion';
import { PanelLeft, Sparkles } from 'lucide-react';
import Logo from '@/src/components/ui/logo';
import { ThemeToggle } from '@/src/components/ui/themeToggle';

interface HomeNavbarProps {
	className?: string;
}

const HomeNavbar = ({ className }: HomeNavbarProps) => {
	const { isOpen, toggle } = useChatSidebarStore();

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
				{!isOpen && (
					<button
						onClick={toggle}
						aria-label="Open sidebar"
						className={cn(
							'flex items-center justify-center h-7 w-7 rounded-lg',
							'text-muted-foreground hover:text-foreground hover:bg-muted/60',
							'transition-colors duration-150',
						)}
					>
						<PanelLeft className="h-4 w-4" />
					</button>
				)}

				<div className="flex items-center gap-2">
					<div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center overflow-hidden">
						<Logo imageStyles="w-4 h-4 object-contain" />
					</div>
					<span className="text-sm font-semibold tracking-tight text-foreground">
						Asynx
					</span>
					<span className="hidden sm:inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
						<Sparkles className="h-2.5 w-2.5" />
						Intelligence
					</span>
				</div>
			</div>

			{/* Right: theme toggle */}
			<div className="flex items-center gap-1">
				<ThemeToggle />
			</div>
		</motion.header>
	);
};

export default HomeNavbar;
