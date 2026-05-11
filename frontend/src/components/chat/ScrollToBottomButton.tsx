'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface ScrollToBottomButtonProps {
	visible: boolean;
	onClick: () => void;
	className?: string;
}

export default function ScrollToBottomButton({
	visible,
	onClick,
	className,
}: ScrollToBottomButtonProps) {
	return (
		<AnimatePresence>
			{visible && (
				<motion.button
					initial={{ opacity: 0, scale: 0.8, y: 8 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					exit={{ opacity: 0, scale: 0.8, y: 8 }}
					transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
					onClick={onClick}
					aria-label="Scroll to bottom"
					className={cn(
						'flex items-center justify-center',
						'h-9 w-9 rounded-full',
						'bg-background/90 backdrop-blur-sm',
						'border border-border shadow-lg',
						'text-muted-foreground hover:text-foreground',
						'hover:border-primary/30 hover:shadow-glow-sm',
						'transition-colors duration-150',
						className,
					)}
				>
					<ArrowDown className="h-4 w-4" />
				</motion.button>
			)}
		</AnimatePresence>
	);
}
