'use client';

import { ChevronDown } from 'lucide-react';
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
} from '@/src/components/ui/dropdown-menu';
import { cn } from '@/src/lib/utils';
import {
	CHAT_MODELS,
	ChatModelId,
	FLAT_CHAT_MODELS,
} from '@/src/constants/chat/chatModels.constants';
import { Dispatch, SetStateAction } from 'react';
import { ChatModel } from '@/src/features/chat/types/chatModels';

interface ModelSelectorProps {
	value: ChatModelId;
	onChange:
		| Dispatch<SetStateAction<ChatModel>>
		| ((nextModel: ChatModel) => void);
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

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild disabled={disabled}>
				<button
					type="button"
					className={cn(
						'flex items-center gap-1 rounded-md px-2 py-1',
						'text-xs text-muted-foreground',
						'hover:text-foreground hover:bg-muted/50',
						'transition-colors duration-150',
						'outline-none focus-visible:ring-1 focus-visible:ring-ring',
						'disabled:cursor-not-allowed disabled:opacity-40',
						className,
					)}
					aria-label="Select AI model"
				>
					<span className="hidden sm:inline max-w-[120px] truncate">
						{selected.label}
					</span>
					<ChevronDown className="h-3 w-3 opacity-50 shrink-0" />
				</button>
			</DropdownMenuTrigger>

			<DropdownMenuContent
				align="end"
				sideOffset={6}
				className="w-56 rounded-xl border border-border bg-popover p-1 shadow-lg"
			>
				{CHAT_MODELS.map((group) => (
					<div key={group.provider}>
						{group.options.length > 0 && (
							<p className="px-3 pt-2 pb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">
								{group.provider}
							</p>
						)}
						{group.options.map((model) => {
							const isSelected = model.value === selected.value;
							return (
								<DropdownMenuItem
									key={model.value}
									onClick={() => onChange(model.value)}
									className={cn(
										'flex items-center justify-between rounded-lg px-3 py-2 cursor-pointer',
										'text-sm transition-colors',
										isSelected
											? 'bg-primary/8 text-foreground font-medium'
											: 'text-muted-foreground hover:text-foreground',
									)}
								>
									<span>{model.label}</span>
									{isSelected && (
										<span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
									)}
								</DropdownMenuItem>
							);
						})}
					</div>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
