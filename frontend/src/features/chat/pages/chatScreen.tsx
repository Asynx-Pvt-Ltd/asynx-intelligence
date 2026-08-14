'use client';

import { AssistantRuntimeProvider } from '@assistant-ui/react';
import { useEffect } from 'react';
import { useChatScreenRefs } from '../hooks/chatScreen/useChatScreenRefs';
import { useChatMessages } from '../hooks/chatScreen/useChatMessages';
import { useChatHydration } from '../hooks/chatScreen/useChatHydration';
import { useChatModelSync } from '../hooks/chatScreen/useChatModelSync';
import { usePendingPromptInit } from '../hooks/chatScreen/usePendingPromptInit';
import { useAsynxRuntime } from '../hooks/chatScreen/useAsynxRuntime';
import { useUploadStore } from '@/src/stores/document/uploadStore';
import type { ChatModel } from '../types/chatModels';
import { ChatSkeleton } from '../components/chatArea/ChatSkeleton';
import AsynxThread from '../components/thread/AsynxThread';

export default function ChatScreen({
	chatId,
	model,
}: {
	chatId: string;
	model: ChatModel;
}) {
	const { streamRunIdRef, messagesRef, initializedRef } = useChatScreenRefs({
		messages: [],
		setShowScrollBtn: () => {},
	});

	const { messages, setMessages, sendMessage, isLoading, streamingIndex } =
		useChatMessages({ chatId, streamRunIdRef, messagesRef });

	const { isHydrating } = useChatHydration({ chatId, setMessages });

	const { selectedModel, handleModelChange } = useChatModelSync({ model });

	const files = useUploadStore((s) => s.files);

	usePendingPromptInit({
		isHydrating,
		selectedModel,
		sendMessage,
		initializedRef,
	});

	// The runtime is used exclusively by AsynxComposer (ComposerPrimitive)
	// Message rendering is done directly from state in AsynxThread
	const runtime = useAsynxRuntime({
		messages,
		setMessages,
		isLoading,
		streamingIndex,
		sendMessage,
		selectedModel,
		files,
	});

	useEffect(() => {
		initializedRef.current = false;
		streamRunIdRef.current += 1;
		setMessages([]);
	}, [chatId, initializedRef, streamRunIdRef, setMessages]);

	useEffect(() => {
		messagesRef.current = messages;
	}, [messages, messagesRef]);

	if (isHydrating) {
		return <ChatSkeleton />;
	}

	return (
		<AssistantRuntimeProvider runtime={runtime}>
			<AsynxThread
				messages={messages}
				isLoading={isLoading}
				streamingIndex={streamingIndex}
				selectedModel={selectedModel}
				onModelChange={handleModelChange}
				conversationId={chatId}
				disabled={isHydrating}
			/>
		</AssistantRuntimeProvider>
	);
}
