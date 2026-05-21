'use client';

import { ChevronDown, Zap, Brain, Sparkles } from 'lucide-react';
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
} from '@/src/components/ui/dropdown-menu';
import { cn } from '@/src/lib/utils';
import {
	CHAT_MODELS,
	ChatModelId,
	FLAT_CHAT_MODELS,
} from '@/src/constants/chat/chatModels.constants';
import { Dispatch, SetStateAction } from 'react';
import { ChatModel } from '@/src/features/chat/types/chatModels';

type BadgeVariant = 'default' | 'fast' | 'power';

interface ModelMeta {
	badge: string;
	badgeVariant: BadgeVariant;
	latency: string;
}

const MODEL_META: Record<ChatModelId, ModelMeta> = {
	'gpt-5-mini': {
		badge: 'Fast',
		badgeVariant: 'fast',
		latency: '~0.8s',
	},
	'gpt-5.1': {
		badge: 'Power',
		badgeVariant: 'power',
		latency: '~1.8s',
	},
	'claude-opus-4.5': {
		badge: 'Power',
		badgeVariant: 'power',
		latency: '~2.8s',
	},
	'claude-sonnet-4-5': {
		badge: 'Default',
		badgeVariant: 'default',
		latency: '~1.2s',
	},
	'grok-4-fast-non-reasoning': {
		badge: 'Fast',
		badgeVariant: 'fast',
		latency: '~0.9s',
	},
};

const BadgeIcon = ({ variant }: { variant: BadgeVariant }) => {
	if (variant === 'fast') return <Zap className="h-3 w-3" />;
	if (variant === 'power') return <Brain className="h-3 w-3" />;
	return <Sparkles className="h-3 w-3" />;
};

const badgeStyles: Record<BadgeVariant, string> = {
	default: 'bg-primary/10 text-primary border border-primary/20',
	fast: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
	power: 'bg-violet-500/10 text-violet-400 border border-violet-500/20',
};

interface ModelSelectorProps {
	value: ChatModelId;
	onChange: Dispatch<SetStateAction<ChatModel>>;
	className?: string;
	disabled?: boolean;
}

export default function ModelSelector({
	value,
	onChange,
	className,
	disabled = false,
}: ModelSelectorProps) {
	const selected =
		FLAT_CHAT_MODELS.find((model) => model.value === value) ??
		FLAT_CHAT_MODELS[0];

	const selectedMeta = MODEL_META[selected.value];

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild disabled={disabled}>
				<button
					type="button"
					className={cn(
						'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5',
						'text-xs font-medium text-muted-foreground',
						'hover:text-foreground hover:bg-muted/60',
						'transition-all duration-150',
						'border border-transparent hover:border-border',
						'outline-none focus-visible:ring-1 focus-visible:ring-ring',
						'disabled:cursor-not-allowed disabled:opacity-50',
						className,
					)}
					aria-label="Select AI model"
				>
					<span
						className={cn(
							'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold tracking-wide',
							badgeStyles[selectedMeta.badgeVariant],
						)}
					>
						<BadgeIcon variant={selectedMeta.badgeVariant} />
						{selectedMeta.badge}
					</span>
					<span className="hidden sm:inline">{selected.label}</span>
					<ChevronDown className="h-3 w-3 opacity-60" />
				</button>
			</DropdownMenuTrigger>

			<DropdownMenuContent
				align="start"
				sideOffset={6}
				className="w-64 rounded-xl border border-border bg-popover p-1 shadow-lg"
			>
				{CHAT_MODELS.map((group) => (
					<div key={group.provider}>
						{group.options.map((model) => {
							const meta = MODEL_META[model.value];
							const isSelected = model.value === selected.value;

							return (
								<DropdownMenuItem
									key={model.value}
									onClick={() => onChange(model.value)}
									className={cn(
										'flex items-center justify-between rounded-lg px-3 py-2.5 cursor-pointer',
										'text-sm transition-colors',
										isSelected
											? 'bg-primary/10 text-foreground'
											: 'text-muted-foreground hover:text-foreground',
									)}
								>
									<div className="flex min-w-0 flex-col">
										<div className="flex items-center gap-2.5">
											<span
												className={cn(
													'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold',
													badgeStyles[meta.badgeVariant],
												)}
											>
												<BadgeIcon variant={meta.badgeVariant} />
												{meta.badge}
											</span>
											<span className="font-medium">{model.label}</span>
										</div>
										{/* <span className="mt-0.5 text-[11px] text-muted-foreground/60">
											{model.value}
										</span> */}
									</div>

									<span className="text-[10px] tabular-nums text-muted-foreground/60">
										{meta.latency}
									</span>
								</DropdownMenuItem>
							);
						})}
					</div>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
