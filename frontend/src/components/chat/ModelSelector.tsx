'use client';

import { useState } from 'react';
import { ChevronDown, Zap, Brain, Sparkles } from 'lucide-react';
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
} from '@/src/components/ui/dropdown-menu';
import { cn } from '@/src/lib/utils';

export interface ModelOption {
	id: string;
	name: string;
	label: string;
	badge: string;
	badgeVariant: 'default' | 'fast' | 'power';
	latency: string;
}

const MODELS: ModelOption[] = [
	{
		id: 'claude-sonnet-4-6',
		name: 'Sonnet 4.6',
		label: 'claude-sonnet-4-6',
		badge: 'Default',
		badgeVariant: 'default',
		latency: '~1.2s',
	},
	{
		id: 'claude-haiku-4-5',
		name: 'Haiku 4.5',
		label: 'claude-haiku-4-5',
		badge: 'Fast',
		badgeVariant: 'fast',
		latency: '~0.4s',
	},
	{
		id: 'claude-opus-4-7',
		name: 'Opus 4.7',
		label: 'claude-opus-4-7',
		badge: 'Powerful',
		badgeVariant: 'power',
		latency: '~3.1s',
	},
];

const BadgeIcon = ({ variant }: { variant: ModelOption['badgeVariant'] }) => {
	if (variant === 'fast') return <Zap className="h-3 w-3" />;
	if (variant === 'power') return <Brain className="h-3 w-3" />;
	return <Sparkles className="h-3 w-3" />;
};

const badgeStyles: Record<ModelOption['badgeVariant'], string> = {
	default:
		'bg-primary/10 text-primary border border-primary/20',
	fast:
		'bg-amber-500/10 text-amber-400 border border-amber-500/20',
	power:
		'bg-violet-500/10 text-violet-400 border border-violet-500/20',
};

interface ModelSelectorProps {
	className?: string;
	onModelChange?: (model: ModelOption) => void;
}

export default function ModelSelector({
	className,
	onModelChange,
}: ModelSelectorProps) {
	const [selected, setSelected] = useState<ModelOption>(MODELS[0]);

	const handleSelect = (model: ModelOption) => {
		setSelected(model);
		onModelChange?.(model);
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					className={cn(
						'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5',
						'text-xs font-medium text-muted-foreground',
						'hover:text-foreground hover:bg-muted/60',
						'transition-all duration-150',
						'border border-transparent hover:border-border',
						'outline-none focus-visible:ring-1 focus-visible:ring-ring',
						className,
					)}
					aria-label="Select AI model"
				>
					<span
						className={cn(
							'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold tracking-wide',
							badgeStyles[selected.badgeVariant],
						)}
					>
						<BadgeIcon variant={selected.badgeVariant} />
						{selected.badge}
					</span>
					<span className="hidden sm:inline">{selected.name}</span>
					<ChevronDown className="h-3 w-3 opacity-60" />
				</button>
			</DropdownMenuTrigger>

			<DropdownMenuContent
				align="end"
				sideOffset={6}
				className="w-52 rounded-xl border border-border bg-popover p-1 shadow-lg"
			>
				{MODELS.map((model) => (
					<DropdownMenuItem
						key={model.id}
						onClick={() => handleSelect(model)}
						className={cn(
							'flex items-center justify-between rounded-lg px-3 py-2.5 cursor-pointer',
							'text-sm transition-colors',
							selected.id === model.id
								? 'bg-primary/10 text-foreground'
								: 'text-muted-foreground hover:text-foreground',
						)}
					>
						<div className="flex items-center gap-2.5">
							<span
								className={cn(
									'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold',
									badgeStyles[model.badgeVariant],
								)}
							>
								<BadgeIcon variant={model.badgeVariant} />
								{model.badge}
							</span>
							<span className="font-medium">{model.name}</span>
						</div>
						<span className="text-[10px] tabular-nums text-muted-foreground/60">
							{model.latency}
						</span>
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
