'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Palette, Sliders, Keyboard, Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/src/lib/utils';

/* ── Types ──────────────────────────────────────────────────── */
interface SettingsDrawerProps {
	open: boolean;
	onClose: () => void;
}

type ThemeOption = 'light' | 'dark' | 'system';
type Tab = 'appearance' | 'model' | 'shortcuts';

const ACCENT_PRESETS = [
	{ id: 'emerald', label: 'Emerald', color: '#23c69e' },
	{ id: 'blue', label: 'Electric Blue', color: '#3b82f6' },
	{ id: 'amber', label: 'Amber', color: '#f59e0b' },
	{ id: 'violet', label: 'Violet', color: '#8b5cf6' },
] as const;

type AccentId = (typeof ACCENT_PRESETS)[number]['id'];

const KEYBOARD_SHORTCUTS = [
	{ keys: ['Enter'], description: 'Send message' },
	{ keys: ['Shift', 'Enter'], description: 'New line' },
	{ keys: ['⌘', 'K'], description: 'Focus input' },
	{ keys: ['⌘', '/'], description: 'Open settings' },
	{ keys: ['Esc'], description: 'Cancel / close' },
];

/* ── Drawer ─────────────────────────────────────────────────── */
export default function SettingsDrawer({ open, onClose }: SettingsDrawerProps) {
	const [tab, setTab] = useState<Tab>('appearance');
	const { theme, setTheme } = useTheme();
	const [accent, setAccent] = useState<AccentId>('emerald');
	const [temperature, setTemperature] = useState(0.7);
	const [systemPrompt, setSystemPrompt] = useState('');

	/* Load persisted settings */
	useEffect(() => {
		const storedAccent = localStorage.getItem('accent') as AccentId | null;
		if (storedAccent) setAccent(storedAccent);

		const storedTemp = localStorage.getItem('temperature');
		if (storedTemp) setTemperature(parseFloat(storedTemp));

		const storedPrompt = localStorage.getItem('systemPrompt');
		if (storedPrompt) setSystemPrompt(storedPrompt);
	}, []);

	/* Apply accent color */
	useEffect(() => {
		const preset = ACCENT_PRESETS.find((p) => p.id === accent);
		if (!preset) return;
		document.documentElement.style.setProperty('--primary', preset.color);
		localStorage.setItem('accent', accent);
	}, [accent]);

	/* Close on Escape */
	useEffect(() => {
		if (!open) return;
		const handler = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose();
		};
		window.addEventListener('keydown', handler);
		return () => window.removeEventListener('keydown', handler);
	}, [open, onClose]);

	const tabs: { id: Tab; label: string; icon: typeof Palette }[] = [
		{ id: 'appearance', label: 'Appearance', icon: Palette },
		{ id: 'model', label: 'Model', icon: Sliders },
		{ id: 'shortcuts', label: 'Shortcuts', icon: Keyboard },
	];

	const themeOptions: { value: ThemeOption; icon: typeof Sun; label: string }[] = [
		{ value: 'light', icon: Sun, label: 'Light' },
		{ value: 'dark', icon: Moon, label: 'Dark' },
		{ value: 'system', icon: Monitor, label: 'System' },
	];

	return (
		<AnimatePresence>
			{open && (
				<>
					{/* Backdrop */}
					<motion.div
						key="backdrop"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 }}
						onClick={onClose}
						className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
						aria-hidden
					/>

					{/* Drawer panel */}
					<motion.aside
						key="drawer"
						initial={{ x: '100%', opacity: 0 }}
						animate={{ x: 0, opacity: 1 }}
						exit={{ x: '100%', opacity: 0 }}
						transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
						role="dialog"
						aria-label="Settings"
						aria-modal="true"
						className={cn(
							'fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col',
							'bg-card border-l border-border shadow-xl',
						)}
					>
						{/* Header */}
						<div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
							<h2 className="text-base font-semibold text-foreground">
								Settings
							</h2>
							<button
								onClick={onClose}
								aria-label="Close settings"
								className={cn(
									'flex h-7 w-7 items-center justify-center rounded-lg',
									'text-muted-foreground hover:text-foreground hover:bg-muted/60',
									'transition-colors duration-150',
								)}
							>
								<X className="h-4 w-4" />
							</button>
						</div>

						{/* Tab bar */}
						<div className="flex items-center gap-1 px-4 pt-3 pb-0 border-b border-border shrink-0">
							{tabs.map(({ id, label, icon: Icon }) => (
								<button
									key={id}
									onClick={() => setTab(id)}
									className={cn(
										'flex items-center gap-1.5 rounded-t-lg px-3 py-2 text-xs font-medium',
										'transition-colors duration-150 border-b-2 -mb-px',
										tab === id
											? 'border-primary text-primary'
											: 'border-transparent text-muted-foreground hover:text-foreground',
									)}
								>
									<Icon className="h-3.5 w-3.5" />
									{label}
								</button>
							))}
						</div>

						{/* Content */}
						<div className="flex-1 overflow-y-auto px-5 py-5 space-y-6 scrollbar-thin">
							{/* ── Appearance tab ────────────────────────── */}
							{tab === 'appearance' && (
								<motion.div
									key="appearance"
									initial={{ opacity: 0, y: 6 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.2 }}
									className="space-y-6"
								>
									{/* Theme */}
									<section className="space-y-3">
										<h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
											Theme
										</h3>
										<div className="grid grid-cols-3 gap-2">
											{themeOptions.map(({ value, icon: Icon, label }) => (
												<button
													key={value}
													onClick={() => setTheme(value)}
													className={cn(
														'flex flex-col items-center gap-2 rounded-xl border px-2 py-3',
														'text-xs font-medium transition-all duration-150',
														theme === value
															? 'border-primary bg-primary/10 text-primary shadow-glow-sm'
															: 'border-border text-muted-foreground hover:border-primary/30 hover:text-foreground',
													)}
												>
													<Icon className="h-4 w-4" />
													{label}
												</button>
											))}
										</div>
									</section>

									{/* Accent color */}
									<section className="space-y-3">
										<h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
											Accent Color
										</h3>
										<div className="flex gap-3">
											{ACCENT_PRESETS.map((preset) => (
												<button
													key={preset.id}
													onClick={() => setAccent(preset.id)}
													title={preset.label}
													aria-label={`Set accent to ${preset.label}`}
													className={cn(
														'relative h-8 w-8 rounded-full transition-all duration-200',
														accent === preset.id && 'ring-2 ring-offset-2 ring-offset-card scale-110',
													)}
													style={{
														backgroundColor: preset.color,
													}}
												>
													{accent === preset.id && (
														<span className="absolute inset-0 flex items-center justify-center text-white text-[10px]">
															✓
														</span>
													)}
												</button>
											))}
										</div>
										<p className="text-[11px] text-muted-foreground/60">
											Accent color applies across the entire interface.
										</p>
									</section>
								</motion.div>
							)}

							{/* ── Model tab ──────────────────────────────── */}
							{tab === 'model' && (
								<motion.div
									key="model"
									initial={{ opacity: 0, y: 6 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.2 }}
									className="space-y-6"
								>
									{/* Temperature */}
									<section className="space-y-3">
										<div className="flex items-center justify-between">
											<h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
												Temperature
											</h3>
											<span className="text-xs font-mono font-medium text-primary">
												{temperature.toFixed(1)}
											</span>
										</div>
										<input
											type="range"
											min="0"
											max="2"
											step="0.1"
											value={temperature}
											onChange={(e) => {
												const v = parseFloat(e.target.value);
												setTemperature(v);
												localStorage.setItem('temperature', String(v));
											}}
											className={cn(
												'w-full h-1.5 rounded-full appearance-none cursor-pointer',
												'bg-muted',
												'[&::-webkit-slider-thumb]:appearance-none',
												'[&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4',
												'[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary',
												'[&::-webkit-slider-thumb]:shadow-glow-sm',
												'[&::-webkit-slider-thumb]:cursor-pointer',
											)}
											aria-label="Temperature"
										/>
										<div className="flex justify-between text-[10px] text-muted-foreground/50">
											<span>Precise</span>
											<span>Balanced</span>
											<span>Creative</span>
										</div>
									</section>

									{/* System prompt */}
									<section className="space-y-3">
										<h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
											System Prompt
										</h3>
										<textarea
											value={systemPrompt}
											onChange={(e) => {
												setSystemPrompt(e.target.value);
												localStorage.setItem('systemPrompt', e.target.value);
											}}
											placeholder="You are a helpful enterprise AI assistant…"
											rows={6}
											className={cn(
												'w-full resize-none rounded-xl border border-border bg-muted/40 px-3 py-2.5',
												'text-sm text-foreground placeholder:text-muted-foreground/40',
												'outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/30',
												'transition-colors duration-150 scrollbar-thin',
											)}
											aria-label="System prompt"
										/>
										<p className="text-[11px] text-muted-foreground/50">
											Defines the assistant's behavior for all conversations.
										</p>
									</section>
								</motion.div>
							)}

							{/* ── Shortcuts tab ──────────────────────────── */}
							{tab === 'shortcuts' && (
								<motion.div
									key="shortcuts"
									initial={{ opacity: 0, y: 6 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.2 }}
									className="space-y-2"
								>
									<h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
										Keyboard Shortcuts
									</h3>
									<div className="space-y-1">
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
																'text-[11px] font-mono font-medium text-foreground',
																'shadow-sm',
															)}
														>
															{key}
														</kbd>
													))}
												</div>
											</div>
										))}
									</div>
								</motion.div>
							)}
						</div>

						{/* Footer */}
						<div className="px-5 py-3 border-t border-border shrink-0">
							<p className="text-[11px] text-muted-foreground/40 text-center">
								Settings are saved automatically
							</p>
						</div>
					</motion.aside>
				</>
			)}
		</AnimatePresence>
	);
}
