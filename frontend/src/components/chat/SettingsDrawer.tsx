'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Keyboard } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface SettingsDrawerProps {
	open: boolean;
	onClose: () => void;
}

const KEYBOARD_SHORTCUTS = [
	{ keys: ['Enter'], description: 'Send message' },
	{ keys: ['Shift', 'Enter'], description: 'New line' },
	{ keys: ['⌘', '/'], description: 'Keyboard shortcuts' },
	{ keys: ['Esc'], description: 'Close panel' },
];

export default function SettingsDrawer({ open, onClose }: SettingsDrawerProps) {
	return (
		<AnimatePresence>
			{open && (
				<>
					<motion.div
						key="backdrop"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.15 }}
						onClick={onClose}
						className="fixed inset-0 z-40 bg-black/30"
						aria-hidden
					/>

					<motion.aside
						key="drawer"
						initial={{ x: '100%' }}
						animate={{ x: 0 }}
						exit={{ x: '100%' }}
						transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
						role="dialog"
						aria-label="Keyboard shortcuts"
						aria-modal="true"
						className={cn(
							'fixed right-0 top-0 z-50 flex h-full w-full max-w-xs flex-col',
							'bg-card border-l border-border shadow-xl',
						)}
					>
						<div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
							<div className="flex items-center gap-2">
								<Keyboard className="h-4 w-4 text-muted-foreground" />
								<h2 className="text-sm font-semibold text-foreground">
									Keyboard Shortcuts
								</h2>
							</div>
							<button
								onClick={onClose}
								aria-label="Close"
								className={cn(
									'flex h-7 w-7 items-center justify-center rounded-md',
									'text-muted-foreground hover:text-foreground hover:bg-muted/60',
									'transition-colors duration-150',
								)}
							>
								<X className="h-4 w-4" />
							</button>
						</div>

						<div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
							{KEYBOARD_SHORTCUTS.map(({ keys, description }) => (
								<div
									key={description}
									className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-muted/40 transition-colors"
								>
									<span className="text-sm text-muted-foreground">
										{description}
									</span>
									<div className="flex items-center gap-1">
										{keys.map((key) => (
											<kbd
												key={key}
												className={cn(
													'inline-flex items-center justify-center min-w-[1.5rem] h-6 px-1.5 rounded-md',
													'border border-border bg-muted',
													'text-[11px] font-mono font-medium text-foreground shadow-sm',
												)}
											>
												{key}
											</kbd>
										))}
									</div>
								</div>
							))}
						</div>

						<div className="px-5 py-3 border-t border-border shrink-0">
							<p className="text-[11px] text-muted-foreground/40 text-center">
								An Asynx Engineering product ·{' '}
								<a
									href="https://asynx.in"
									target="_blank"
									rel="noopener noreferrer"
									className="hover:text-muted-foreground/70 transition-colors"
								>
									asynx.in
								</a>
							</p>
						</div>
					</motion.aside>
				</>
			)}
		</AnimatePresence>
	);
}
