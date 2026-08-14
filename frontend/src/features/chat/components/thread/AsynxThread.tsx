'use client';

import { ArrowDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/src/lib/utils';
import type { Dispatch, SetStateAction } from 'react';
import type { ChatModel } from '../../types/chatModels';
import type { Message } from '../../types/chatTypes';
import UserMessage from './UserMessage';
import AssistantMessage from './AssistantMessage';
import AsynxComposer from './AsynxComposer';

interface AsynxThreadProps {
	messages: Message[];
	isLoading: boolean;
	streamingIndex: number | null;
	selectedModel: ChatModel;
	onModelChange: Dispatch<SetStateAction<ChatModel>> | ((m: ChatModel) => void);
	conversationId: string;
	disabled?: boolean;
}

export default function AsynxThread({
	messages,
	isLoading,
	streamingIndex,
	selectedModel,
	onModelChange,
	conversationId,
	disabled = false,
}: AsynxThreadProps) {
	const viewportRef = useRef<HTMLDivElement>(null);
	const bottomRef = useRef<HTMLDivElement>(null);
	const isNearBottomRef = useRef(true);
	const [showScrollBtn, setShowScrollBtn] = useState(false);

	// Auto-scroll when content arrives, if user is near bottom
	useEffect(() => {
		if (isNearBottomRef.current) {
			bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
		}
	}, [messages.length, isLoading]);

	const handleScroll = () => {
		const el = viewportRef.current;
		if (!el) return;
		const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
		const nearBottom = distanceFromBottom < 120;
		isNearBottomRef.current = nearBottom;
		setShowScrollBtn(!nearBottom && messages.length > 0);
	};

	const scrollToBottom = () => {
		bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
		setShowScrollBtn(false);
	};

	return (
		<div className="relative flex h-full flex-col bg-chat-screen">
			{/* Message viewport */}
			<div
				ref={viewportRef}
				onScroll={handleScroll}
				className="flex-1 overflow-y-auto scrollbar-thin"
			>
				<div className="mx-auto w-full max-w-3xl px-4 py-6 pb-4">
					{messages.map((msg, idx) => {
						if (msg.role === 'system') return null;

						if (msg.role === 'user') {
							return (
								<UserMessage
									key={msg.id || `user-${idx}`}
									content={msg.content ?? ''}
								/>
							);
						}

						const isStreaming =
							streamingIndex === idx ||
							(isLoading &&
								idx === messages.length - 1 &&
								msg.role === 'assistant');

						return (
							<AssistantMessage
								key={msg.id || `assistant-${idx}`}
								content={msg.content ?? ''}
								isStreaming={isStreaming}
							/>
						);
					})}
					<div ref={bottomRef} className="h-1" />
				</div>
			</div>

			{/* Scroll to bottom */}
			{showScrollBtn && (
				<div className="absolute bottom-24 right-6 z-20 animate-fade-up">
					<button
						type="button"
						onClick={scrollToBottom}
						aria-label="Scroll to bottom"
						className={cn(
							'flex h-8 w-8 items-center justify-center rounded-full',
							'bg-background border border-border shadow-md',
							'text-muted-foreground hover:text-foreground hover:border-foreground/20',
							'transition-colors duration-150',
						)}
					>
						<ArrowDown className="h-3.5 w-3.5" />
					</button>
				</div>
			)}

			{/* Composer */}
			<div
				className={cn(
					'sticky bottom-0 z-10',
					'bg-gradient-to-t from-chat-screen via-chat-screen/90 to-transparent',
					'px-4 pb-4 pt-2',
				)}
			>
				<div className="mx-auto max-w-3xl">
					<AsynxComposer
						selectedModel={selectedModel}
						onModelChange={onModelChange}
						conversationId={conversationId}
						disabled={disabled}
						isLoading={isLoading}
					/>
				</div>
			</div>
		</div>
	);
}
