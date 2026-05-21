'use client';

import ScrollToBottomButton from '@/src/components/chat/ScrollToBottomButton';
import { useEffect, useState } from 'react';
import { useChatScreenRefs } from '../../hooks/chatScreen/useChatScreenRefs';
import { useChatMessages } from '../../hooks/chatScreen/useChatMessages';
import { useChatHydration } from '../../hooks/chatScreen/useChatHydration';
import { useChatScroll } from '../../hooks/chatScreen/useChatScroll';
import { useChatModelSync } from '../../hooks/chatScreen/useChatModelSync';
import { usePendingPromptInit } from '../../hooks/chatScreen/usePendingPromptInit';
import type { ChatModel } from '../../types/chatModels';
import ConversationChatInput from '../chatInputs/conversationChatInput';
import { ChatSkeleton } from './ChatSkeleton';
import { ChatContent } from './ChatContent';

export default function ChatScreen({
	chatId,
	model,
}: {
	chatId: string;
	model: ChatModel;
}) {
	const [showScrollBtn, setShowScrollBtn] = useState(false);

	const {
		bottomRef,
		initializedRef,
		scrollContainerRef,
		streamRunIdRef,
		messagesRef,
	} = useChatScreenRefs({ messages: [], setShowScrollBtn });

	const { messages, setMessages, sendMessage, isLoading, streamingIndex } =
		useChatMessages({
			chatId,
			streamRunIdRef,
			messagesRef,
		});

	const { isHydrating, vectorIndex } = useChatHydration({
		chatId,
		setMessages,
	});

	const { scrollToBottom } = useChatScroll({
		bottomRef,
		scrollContainerRef,
	});

	const { selectedModel, handleModelChange } = useChatModelSync({ model });

	usePendingPromptInit({
		isHydrating,
		selectedModel,
		sendMessage,
		initializedRef,
	});

	useEffect(() => {
		scrollToBottom();
	}, [messages, scrollToBottom]);

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
		<div className="relative flex h-full flex-col">
			<div
				ref={scrollContainerRef}
				className="flex-1 overflow-y-auto scrollbar-thin"
			>
				<div className="mx-auto w-full max-w-3xl px-4 py-6">
					<ChatContent
						chatId={chatId}
						messages={messages}
						isLoading={isLoading}
						streamingIndex={streamingIndex}
						vectorIndex={vectorIndex}
						setMessages={setMessages}
						onSelectPrompt={async (p) =>
							await sendMessage({
								prompt: p,
								files: [],
								model: selectedModel,
							})
						}
						bottomRef={bottomRef}
					/>
				</div>
			</div>

			<div className="absolute bottom-24 right-6 z-20">
				<ScrollToBottomButton
					visible={showScrollBtn}
					onClick={() => scrollToBottom('smooth')}
				/>
			</div>

			<div className="sticky bottom-0 z-10 bg-linear-to-t from-chat-screen via-chat-screen/90 to-transparent px-4 pb-4 pt-2">
				<div className="mx-auto max-w-3xl">
					<ConversationChatInput
						onSendMessage={sendMessage}
						disabled={isHydrating || isLoading}
						conversationId={chatId}
						selectedModel={selectedModel}
						onModelChange={handleModelChange}
					/>
				</div>
			</div>
		</div>
	);
}
