'use client';

import { useEffect, useRef, useState } from 'react';
import { useChatStore } from '@/src/stores/chat/chatStore';
import { streamChatResponse } from '@/src/features/chat/lib/chatStream';
import type { Message, ChatRequest } from '@/src/features/chat/types/chatTypes';
import {
	addConversationMessage,
	getConversation,
	mapHistoryToUiMessages,
} from '../lib/chatHistory';
import ConversationChatInput from './conversationChatInput';

export default function ChatScreen({ chatId }: { chatId: string }) {
	const pendingPrompt = useChatStore((state) => state.pendingPrompt);
	const clearPendingPrompt = useChatStore((state) => state.clearPendingPrompt);

	const [messages, setMessages] = useState<Message[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isHydrating, setIsHydrating] = useState(true);

	const initializedRef = useRef(false);
	const streamRunIdRef = useRef(0);
	const messagesRef = useRef<Message[]>([]);
	const bottomRef = useRef<HTMLDivElement | null>(null);

	const sendMessage = async (prompt: string) => {
		const trimmed = prompt.trim();
		if (!trimmed || isLoading) return;

		const currentRunId = ++streamRunIdRef.current;

		const userMsg: Message = {
			role: 'user',
			content: trimmed,
		};

		const assistantMsg: Message = {
			role: 'assistant',
			content: '',
		};

		const baseMessages = messagesRef.current;

		setMessages((prev) => [...prev, userMsg, assistantMsg]);
		setIsLoading(true);

		try {
			await addConversationMessage(chatId, {
				role: 'user',
				content: userMsg.content,
			});

			const payload: ChatRequest = {
				messages: [...baseMessages, userMsg],
				model_name: 'gpt-5-mini',
				k: 1,
				kwargs: {},
			};

			const { fullContent, fullReasoning } = await streamChatResponse(
				payload,
				(chunk) => {
					if (!chunk.token) return;
					if (streamRunIdRef.current !== currentRunId) return;

					setMessages((prev) => {
						const lastIndex = prev.length - 1;
						if (lastIndex < 0) return prev;

						const last = prev[lastIndex];
						if (last.role !== 'assistant') return prev;

						const updatedAssistant: Message = {
							...last,
							content: last.content + chunk.token,
						};

						return [...prev.slice(0, lastIndex), updatedAssistant];
					});
				},
			);

			if (streamRunIdRef.current !== currentRunId) return;

			setMessages((prev) => {
				const lastIndex = prev.length - 1;
				if (lastIndex < 0) return prev;

				const last = prev[lastIndex];
				if (last.role !== 'assistant') return prev;

				const updatedAssistant: Message = {
					...last,
					content: fullContent,
				};

				return [...prev.slice(0, lastIndex), updatedAssistant];
			});

			await addConversationMessage(chatId, {
				role: 'assistant',
				content: fullContent,
				reasoning_content: fullReasoning,
				model_name: 'gpt-5-mini',
			});
		} catch {
			if (streamRunIdRef.current !== currentRunId) return;

			setMessages((prev) => {
				const lastIndex = prev.length - 1;
				if (lastIndex < 0) return prev;

				const last = prev[lastIndex];
				if (last.role !== 'assistant') return prev;

				const updatedAssistant: Message = {
					...last,
					content: 'Something went wrong while fetching the response.',
				};

				return [...prev.slice(0, lastIndex), updatedAssistant];
			});
		} finally {
			if (streamRunIdRef.current === currentRunId) {
				setIsLoading(false);
			}
		}
	};

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages]);

	useEffect(() => {
		messagesRef.current = messages;
	}, [messages]);

	useEffect(() => {
		initializedRef.current = false;
		streamRunIdRef.current += 1;
		setMessages([]);
		setIsHydrating(true);
	}, [chatId]);

	useEffect(() => {
		let cancelled = false;

		const hydrate = async () => {
			try {
				const convo = await getConversation(chatId);
				if (!cancelled) {
					setMessages(mapHistoryToUiMessages(convo.messages ?? []));
				}
			} catch {
				if (!cancelled) {
					setMessages([]);
				}
			} finally {
				if (!cancelled) {
					setIsHydrating(false);
				}
			}
		};

		void hydrate();

		return () => {
			cancelled = true;
		};
	}, [chatId]);

	useEffect(() => {
		if (initializedRef.current) return;
		if (!pendingPrompt || isHydrating) return;

		initializedRef.current = true;
		clearPendingPrompt();

		void sendMessage(pendingPrompt);
	}, [pendingPrompt, isHydrating, clearPendingPrompt]);

	if (isHydrating) return <div className="p-6">Loading conversation...</div>;

	return (
		<div className="mx-auto flex h-full w-full max-w-4xl flex-col">
			<div className="flex-1 px-4 py-6">
				<div className="flex flex-col gap-4">
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
					<div ref={bottomRef} />
				</div>
			</div>

			<div className="sticky bottom-0 z-10 shrink-0 bg-background px-4 pb-4 pt-3">
				<ConversationChatInput
					onSendMessage={sendMessage}
					disabled={isHydrating || isLoading}
				/>
			</div>
		</div>
	);
}
