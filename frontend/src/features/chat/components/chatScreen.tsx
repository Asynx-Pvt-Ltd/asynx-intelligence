'use client';

import { useEffect, useRef, useState } from 'react';
import { useChatStore } from '@/src/stores/chat/chatStore';
import { streamChatResponse } from '@/src/features/chat/lib/chatStream';
import type { Message, ChatRequest } from '@/src/features/chat/types/chatTypes';

export default function ChatScreen({ chatId }: { chatId: string }) {
	const pendingPrompt = useChatStore((state) => state.pendingPrompt);
	const clearPendingPrompt = useChatStore((state) => state.clearPendingPrompt);

	const [messages, setMessages] = useState<Message[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const initializedRef = useRef(false);

	useEffect(() => {
		if (!pendingPrompt || initializedRef.current) return;

		initializedRef.current = true;

		const bootstrapChat = async () => {
			const userMessage: Message = {
				role: 'user',
				content: pendingPrompt,
			};

			const assistantMessage: Message = {
				role: 'assistant',
				content: '',
			};

			setMessages([userMessage, assistantMessage]);
			clearPendingPrompt();
			setIsLoading(true);

			const payload: ChatRequest = {
				messages: [userMessage],
				model_name: 'gpt-5-mini',
				k: 5,
				kwargs: {},
			};

			try {
				await streamChatResponse(payload, (token) => {
					setMessages((prev) => {
						const next = [...prev];
						const lastIndex = next.length - 1;

						if (lastIndex >= 0 && next[lastIndex].role === 'assistant') {
							next[lastIndex] = {
								...next[lastIndex],
								content: next[lastIndex].content + token,
							};
						}

						return next;
					});
				});
			} catch (error) {
				setMessages((prev) => {
					const next = [...prev];
					const lastIndex = next.length - 1;

					if (lastIndex >= 0 && next[lastIndex].role === 'assistant') {
						next[lastIndex] = {
							role: 'assistant',
							content: 'Something went wrong while fetching the response.',
						};
					}

					return next;
				});
			} finally {
				setIsLoading(false);
			}
		};

		void bootstrapChat();
	}, [pendingPrompt, clearPendingPrompt]);

	return (
		<div className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-4 py-6">
			<div className="text-sm text-muted-foreground">Chat ID: {chatId}</div>

			{messages.map((message, index) => (
				<div
					key={`${message.role}-${index}`}
					className={
						message.role === 'user'
							? 'ml-auto max-w-[80%] rounded-2xl bg-primary px-4 py-3 text-primary-foreground'
							: 'max-w-[80%] rounded-2xl bg-muted px-4 py-3 text-foreground'
					}
				>
					{message.content || (isLoading ? 'Thinking...' : '')}
				</div>
			))}
		</div>
	);
}
