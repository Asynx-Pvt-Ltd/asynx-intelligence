'use client';

import { useEffect, useRef, useState } from 'react';
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
import ChatMessageList from './chatMessageList';
import { useUploadStore } from '@/src/stores/document/uploadStore';
import type { AttachedFile } from '@/src/features/documents/types/documentTypes';

export default function ChatScreen({ chatId }: { chatId: string }) {
	const pendingPrompt = useChatStore((state) => state.pendingPrompt);
	const clearPendingPrompt = useChatStore((state) => state.clearPendingPrompt);

	const { files } = useUploadStore((s) => s);
	const [messages, setMessages] = useState<Message[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isHydrating, setIsHydrating] = useState(true);

	const initializedRef = useRef(false);
	const streamRunIdRef = useRef(0);
	const messagesRef = useRef<Message[]>([]);
	const bottomRef = useRef<HTMLDivElement | null>(null);

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

		// Store file IDs to remove after sending
		const fileIdsToRemove = uploadedFiles.map((f) => f.id);

		const userMsg: Message = {
			role: 'user',
			content: trimmed,
			attached_files: attachedFiles.length > 0 ? attachedFiles : undefined,
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
				attached_files: [],
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
				// Remove uploaded files after sending
				fileIdsToRemove.forEach((id) => {
					useUploadStore.getState().removeFile(id);
				});
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

		void sendMessage({ prompt: pendingPrompt, files: files });
	}, [pendingPrompt, isHydrating, clearPendingPrompt]);

	if (isHydrating) return <div className="p-6">Loading conversation...</div>;

	return (
		<div className="mx-auto flex h-full w-full max-w-4xl flex-col">
			<div className="flex-1 px-4 py-6">
				<div className="flex flex-col gap-4">
					<ChatMessageList messages={messages} isLoading={isLoading} />
					<div ref={bottomRef} />
				</div>
			</div>

			<div className="mb-6 px-4">
				<ConversationChatInput
					onSendMessage={sendMessage}
					disabled={isHydrating || isLoading}
					conversationId={chatId}
				/>
			</div>
		</div>
	);
}
