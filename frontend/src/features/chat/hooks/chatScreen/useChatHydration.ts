import { useEffect, useState } from 'react';
import { getConversation, mapHistoryToUiMessages } from '../../lib/chatHistory';
import type { Message } from '../../types/chatTypes';

interface UseChatHydrationProps {
	chatId: string;
	setMessages: (messages: Message[]) => void;
}

export const useChatHydration = ({
	chatId,
	setMessages,
}: UseChatHydrationProps) => {
	const [isHydrating, setIsHydrating] = useState(true);
	const [vectorIndex, setVectorIndex] = useState<string | undefined>();

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
	}, [chatId, setMessages]);

	return {
		isHydrating,
		vectorIndex,
	};
};
