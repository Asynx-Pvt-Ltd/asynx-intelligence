import EmptyState from '@/src/components/chat/EmptyState';
import { Dispatch, SetStateAction } from 'react';
import type { Message } from '../../types/chatTypes';
import ChatMessageList from '../messages/chatMessageList';

interface ChatContentProps {
	chatId: string;
	messages: Message[];
	isLoading: boolean;
	streamingIndex: number | null;
	vectorIndex: string | undefined;
	setMessages: Dispatch<SetStateAction<Message[]>>;
	onSelectPrompt: (prompt: string) => void;
	bottomRef: React.RefObject<HTMLDivElement | null>;
}

export const ChatContent = ({
	chatId,
	messages,
	isLoading,
	streamingIndex,
	vectorIndex,
	setMessages,
	onSelectPrompt,
	bottomRef,
}: ChatContentProps) => {
	if (messages.length === 0) {
		return <EmptyState onSelectPrompt={(p) => void onSelectPrompt(p)} />;
	}

	return (
		<>
			<ChatMessageList
				conversationId={chatId}
				messages={messages}
				isLoading={isLoading}
				setMessages={setMessages}
				streamingIndex={streamingIndex}
				vectorIndex={vectorIndex}
			/>
			<div ref={bottomRef} className="h-2" />
		</>
	);
};
