'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useChatStore } from '@/src/stores/chat/chatStore';
import { streamChatResponse } from '@/src/features/chat/lib/chatStream';
import type {
	Message,
	ChatRequest,
	ChatSubmitPayload,
} from '@/src/features/chat/types/chatTypes';
import {
	addConversationMessage,
	getConversation,
	mapHistoryToUiMessages,
} from '../lib/chatHistory';
import ConversationChatInput from './conversationChatInput';
import ChatMessageList from './messages/chatMessageList';
import { useUploadStore } from '@/src/stores/document/uploadStore';
import type { AttachedFile } from '@/src/features/documents/types/documentTypes';
import ScrollToBottomButton from '@/src/components/chat/ScrollToBottomButton';
import EmptyState from '@/src/components/chat/EmptyState';

export default function ChatScreen({ chatId }: { chatId: string }) {
	const pendingPrompt = useChatStore((state) => state.pendingPrompt);
	const clearPendingPrompt = useChatStore((state) => state.clearPendingPrompt);

	const { files } = useUploadStore((s) => s);
	const [messages, setMessages] = useState<Message[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isHydrating, setIsHydrating] = useState(true);
	const [streamingIndex, setStreamingIndex] = useState<number | null>(null);
	const [vectorIndex, setVectorIndex] = useState<string | undefined>();
	const [showScrollBtn, setShowScrollBtn] = useState(false);

	const initializedRef = useRef(false);
	const streamRunIdRef = useRef(0);
	const messagesRef = useRef<Message[]>([]);
	const scrollContainerRef = useRef<HTMLDivElement | null>(null);
	const bottomRef = useRef<HTMLDivElement | null>(null);

	const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
		bottomRef.current?.scrollIntoView({ behavior });
	}, []);

	const sendMessage = async ({ prompt, files }: ChatSubmitPayload) => {
		const trimmed = prompt.trim();
		if (!trimmed || isLoading) return;

		const currentRunId = ++streamRunIdRef.current;

		const uploadedFiles = files.filter(
			(f) =>
				f.status === 'uploaded' &&
				f.conversationId &&
				f.conversationId === chatId,
		);

		const attachedFiles: AttachedFile[] = uploadedFiles.map((f) => ({
			file_id: f.fileId,
			file_name: f.fileName,
			document_ids: f.documentIds,
		}));

		const fileIdsToRemove = uploadedFiles.map((f) => f.id);

		const userMsg: Message = {
			id: '',
			role: 'user',
			content: trimmed,
			attached_files: attachedFiles.length > 0 ? attachedFiles : undefined,
		};

		const assistantMsg: Message = { id: '', role: 'assistant', content: '' };
		const baseMessages = messagesRef.current;

		setMessages((prev) => {
			const next = [...prev, userMsg, assistantMsg];
			setStreamingIndex(next.length - 1);
			return next;
		});
		setIsLoading(true);

		try {
			await addConversationMessage(chatId, {
				role: 'user',
				content: userMsg.content,
				attached_files: attachedFiles,
			});

			const payload: ChatRequest = {
				messages: [...baseMessages, userMsg],
				conversation_id: chatId,
				model_name: 'gpt-5-mini',
				k: 20,
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
						return [
							...prev.slice(0, lastIndex),
							{ ...last, content: last.content + chunk.token },
						];
					});
				},
			);

			if (streamRunIdRef.current !== currentRunId) return;
			setStreamingIndex(null);

			await addConversationMessage(chatId, {
				role: 'assistant',
				content: fullContent,
				reasoning_content: fullReasoning,
				model_name: 'gpt-5-mini',
				attached_files: [],
			});
		} catch {
			if (streamRunIdRef.current !== currentRunId) return;
			setMessages((prev) => {
				const lastIndex = prev.length - 1;
				if (lastIndex < 0) return prev;
				const last = prev[lastIndex];
				if (last.role !== 'assistant') return prev;
				return [
					...prev.slice(0, lastIndex),
					{
						...last,
						content: 'Something went wrong while fetching the response.',
					},
				];
			});
			setStreamingIndex(null);
		} finally {
			if (streamRunIdRef.current === currentRunId) {
				setIsLoading(false);
				fileIdsToRemove.forEach((id) =>
					useUploadStore.getState().removeFile(id),
				);
				setStreamingIndex(null);
			}
		}
	};

	/* Scroll to bottom when new messages arrive */
	useEffect(() => {
		scrollToBottom();
	}, [messages, scrollToBottom]);

	useEffect(() => {
		messagesRef.current = messages;
	}, [messages]);

	/* Show scroll-to-bottom FAB when scrolled up */
	useEffect(() => {
		const el = scrollContainerRef.current;
		if (!el) return;

		const onScroll = () => {
			const distanceFromBottom =
				el.scrollHeight - el.scrollTop - el.clientHeight;
			setShowScrollBtn(distanceFromBottom > 120);
		};

		el.addEventListener('scroll', onScroll, { passive: true });
		return () => el.removeEventListener('scroll', onScroll);
	}, []);

	/* Reset on chat change */
	useEffect(() => {
		initializedRef.current = false;
		streamRunIdRef.current += 1;
		setMessages([]);
		setIsHydrating(true);
	}, [chatId]);

	/* Hydrate from history */
	useEffect(() => {
		let cancelled = false;
		const hydrate = async () => {
			try {
				const convo = await getConversation(chatId);
				if (!cancelled) {
					setMessages(mapHistoryToUiMessages(convo.messages ?? []));
					setVectorIndex(convo.vector_index || undefined);
				}
			} catch {
				if (!cancelled) setMessages([]);
			} finally {
				if (!cancelled) setIsHydrating(false);
			}
		};
		void hydrate();
		return () => {
			cancelled = true;
		};
	}, [chatId]);

	/* Send pending prompt */
	useEffect(() => {
		if (initializedRef.current) return;
		if (!pendingPrompt || isHydrating) return;

		initializedRef.current = true;
		clearPendingPrompt();
		void sendMessage({ prompt: pendingPrompt, files });
	}, [pendingPrompt, isHydrating, clearPendingPrompt]);

	/* Loading skeleton */
	if (isHydrating) {
		return (
			<div className="flex flex-col gap-4 px-6 py-8 max-w-4xl mx-auto w-full">
				{[80, 60, 90, 50].map((w, i) => (
					<div
						key={i}
						className={`h-12 rounded-2xl shimmer`}
						style={{
							width: `${w}%`,
							alignSelf: i % 2 === 0 ? 'flex-end' : 'flex-start',
						}}
					/>
				))}
			</div>
		);
	}

	return (
		<div className="relative flex h-full flex-col">
			{/* Message list */}
			<div
				ref={scrollContainerRef}
				className="flex-1 overflow-y-auto scrollbar-thin"
			>
				<div className="mx-auto w-full max-w-3xl px-4 py-6">
					{messages.length === 0 ? (
						<EmptyState
							onSelectPrompt={(p) => void sendMessage({ prompt: p, files: [] })}
						/>
					) : (
						<>
							<ChatMessageList
								conversationId={chatId}
								messages={messages}
								isLoading={isLoading}
								streamingIndex={streamingIndex}
								setMessage={setMessages}
								vectorIndex={vectorIndex}
							/>
							<div ref={bottomRef} className="h-2" />
						</>
					)}
				</div>
			</div>

			{/* Scroll-to-bottom FAB */}
			<div className="absolute bottom-24 right-6 z-20">
				<ScrollToBottomButton
					visible={showScrollBtn}
					onClick={() => scrollToBottom('smooth')}
				/>
			</div>

			{/* Floating input bar */}
			<div className="sticky bottom-0 z-10 bg-gradient-to-t from-chat-screen via-chat-screen/90 to-transparent pb-4 pt-2 px-4">
				<div className="mx-auto max-w-3xl">
					<ConversationChatInput
						onSendMessage={sendMessage}
						disabled={isHydrating || isLoading}
						conversationId={chatId}
					/>
				</div>
			</div>
		</div>
	);
}
