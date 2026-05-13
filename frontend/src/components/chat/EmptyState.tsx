'use client';

import { motion } from 'framer-motion';
import { Sparkles, FileText, BarChart2, MessageSquare } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import Logo from '@/src/components/ui/logo';

const SUGGESTED_PROMPTS = [
	{
		icon: FileText,
		label: 'Summarize a document',
		prompt: 'Summarize the key points from the document I uploaded',
	},
	{
		icon: BarChart2,
		label: 'Analyze data',
		prompt: 'Analyze the trends and patterns in this dataset',
	},
	{
		icon: MessageSquare,
		label: 'Draft a response',
		prompt: 'Help me draft a professional response to this email',
	},
];

interface EmptyStateProps {
	onSelectPrompt: (prompt: string) => void;
	className?: string;
}

export default function EmptyState({
	onSelectPrompt,
	className,
}: EmptyStateProps) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 16 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
			className={cn(
				'flex flex-col items-center justify-center gap-8 py-20 px-6',
				className,
			)}
		>
			{/* Logo + wordmark */}
			<div className="flex flex-col items-center gap-4">
				<div className="relative">
					<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 shadow-glow">
						<Logo imageStyles="w-9 h-9 object-contain" />
					</div>
					<span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary shadow-glow-sm">
						<Sparkles className="h-2.5 w-2.5 text-white" />
					</span>
				</div>

				<div className="text-center space-y-1.5">
					<h2 className="font-heading text-2xl font-normal text-foreground tracking-tight">
						How can I help you today?
					</h2>
					<p className="text-sm text-muted-foreground max-w-sm">
						Ask anything, analyze documents, or explore ideas — I'm here to
						help.
					</p>
				</div>
			</div>

			{/* Suggested prompts */}
			<div className="flex flex-wrap justify-center gap-2.5 max-w-xl">
				{SUGGESTED_PROMPTS.map((item, i) => {
					const Icon = item.icon;
					return (
						<motion.button
							key={item.label}
							initial={{ opacity: 0, y: 8 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{
								duration: 0.3,
								delay: 0.1 + i * 0.07,
								ease: [0.25, 0.46, 0.45, 0.94],
							}}
							onClick={() => onSelectPrompt(item.prompt)}
							className={cn(
								'flex items-center gap-2.5 rounded-xl px-4 py-3',
								'border border-border bg-card/60 backdrop-blur-sm',
								'text-sm text-muted-foreground',
								'hover:border-primary/30 hover:bg-primary/5 hover:text-foreground',
								'transition-all duration-200',
								'shadow-sm hover:shadow-glow-sm',
								'group',
							)}
						>
							<Icon className="h-4 w-4 shrink-0 text-primary/60 group-hover:text-primary transition-colors" />
							<span>{item.label}</span>
						</motion.button>
					);
				})}
			</div>
		</motion.div>
	);
}
