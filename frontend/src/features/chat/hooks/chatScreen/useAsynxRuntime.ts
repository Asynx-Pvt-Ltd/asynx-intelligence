'use client';

import { useExternalStoreRuntime } from '@assistant-ui/react';
import type { AppendMessage, ExternalStoreAdapter, ThreadMessageLike } from '@assistant-ui/react';
import type { Message, ChatSubmitPayload } from '../../types/chatTypes';
import type { UploadingFile } from '@/src/features/documents/components/documentUploader';

interface UseAsynxRuntimeProps {
	messages: Message[];
	setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
	isLoading: boolean;
	streamingIndex: number | null;
	sendMessage: (payload: ChatSubmitPayload) => Promise<void>;
	selectedModel: string;
	files: UploadingFile[];
}

function convertMessage(msg: Message, idx: number): ThreadMessageLike {
	return {
		id: msg.id || `asynx-${idx}`,
		role: msg.role === 'system' ? 'system' : msg.role,
		content: msg.content ?? '',
	};
}

export function useAsynxRuntime({
	messages,
	setMessages,
	isLoading,
	sendMessage,
	selectedModel,
	files,
}: UseAsynxRuntimeProps) {
	const adapter: ExternalStoreAdapter<Message> = {
		messages,
		setMessages: (msgs) => setMessages([...(msgs as Message[])]),
		isRunning: isLoading,
		convertMessage,
		onNew: async (appendMsg: AppendMessage) => {
			const text = appendMsg.content
				.filter((p): p is Extract<typeof p, { type: 'text' }> => p.type === 'text')
				.map((p) => p.text)
				.join('\n');

			await sendMessage({ prompt: text, files, model: selectedModel as never });
		},
	};

	return useExternalStoreRuntime(adapter);
}
