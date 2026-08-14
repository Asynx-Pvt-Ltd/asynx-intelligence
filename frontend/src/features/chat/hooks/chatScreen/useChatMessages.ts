import { useCallback, useRef, useState } from 'react';
import { streamChatResponse } from '../../lib/chatStream';
import { addConversationMessage } from '../../lib/chatHistory';
import type {
	ChatRequest,
	ChatSubmitPayload,
	Message,
} from '../../types/chatTypes';
import type { AttachedFile } from '@/src/features/documents/types/documentTypes';
import { useUploadStore } from '@/src/stores/document/uploadStore';

interface UseChatMessagesProps {
	chatId: string;
	streamRunIdRef: React.MutableRefObject<number>;
	messagesRef: React.MutableRefObject<Message[]>;
}

export const useChatMessages = ({
	chatId,
	streamRunIdRef,
	messagesRef,
}: UseChatMessagesProps) => {
	const [messages, setMessages] = useState<Message[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [streamingIndex, setStreamingIndex] = useState<number | null>(null);

	const sendMessage = useCallback(
		async ({ prompt, files, model }: ChatSubmitPayload) => {
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
			const modelForThisRun = model;

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
					model_name: modelForThisRun,
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
					model_name: modelForThisRun,
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
		},
		[chatId, isLoading, streamRunIdRef, messagesRef],
	);

	return {
		messages,
		setMessages,
		sendMessage,
		isLoading,
		streamingIndex,
	};
};
