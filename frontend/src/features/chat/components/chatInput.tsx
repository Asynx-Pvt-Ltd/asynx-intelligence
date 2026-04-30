'use client';

import { FormEvent, KeyboardEvent, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Textarea } from '@/src/components/ui/textarea';
import { cn } from '@/src/lib/utils';

interface ChatInputProps {
	onSubmit: (value: string) => Promise<void> | void;
	placeholder?: string;
	disabled?: boolean;
	isSubmitting?: boolean;
	header?: React.ReactNode;
	defaultValue?: string;
	className?: string;
}

const ChatInput = ({
	onSubmit,
	placeholder = 'Ask anything...',
	disabled = false,
	isSubmitting = false,
	header,
	defaultValue = '',
	className,
}: ChatInputProps) => {
	const [prompt, setPrompt] = useState(defaultValue);

	const trimmed = prompt.trim();
	const isDisabled = disabled || isSubmitting || !trimmed;

	const handleSubmit = async (e?: FormEvent) => {
		e?.preventDefault();

		if (isDisabled) return;

		const value = trimmed;
		setPrompt('');

		try {
			await onSubmit(value);
		} catch (error) {
			setPrompt(value);
			throw error;
		}
	};

	const handleKeyDown = async (e: KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			await handleSubmit();
		}
	};

	return (
		<form onSubmit={handleSubmit} className={cn('h-full w-full', className)}>
			{header}

			<div className="rounded-3xl border bg-background shadow-sm">
				<Textarea
					value={prompt}
					onChange={(e) => setPrompt(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder={placeholder}
					disabled={disabled || isSubmitting}
					className="min-h-24 resize-none border-0 bg-transparent px-5 py-4 text-base shadow-none focus-visible:ring-0"
				/>

				<div className="flex items-center justify-between px-4 pb-4">
					<p className="text-xs text-muted-foreground">
						Press Enter to send, Shift + Enter for newline
					</p>

					<Button
						type="submit"
						size="icon"
						disabled={isDisabled}
						className="rounded-full"
					>
						<ArrowUp className="h-4 w-4" />
					</Button>
				</div>
			</div>
		</form>
	);
};

export default ChatInput;
