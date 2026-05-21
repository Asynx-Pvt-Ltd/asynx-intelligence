import { useCallback } from 'react';

interface UseChatScrollProps {
	bottomRef: React.RefObject<HTMLDivElement | null>;
	scrollContainerRef: React.RefObject<HTMLDivElement | null>;
}

export const useChatScroll = ({
	bottomRef,
	scrollContainerRef,
}: UseChatScrollProps) => {
	const scrollToBottom = useCallback(
		(behavior: ScrollBehavior = 'smooth') => {
			bottomRef.current?.scrollIntoView({ behavior });
		},
		[bottomRef],
	);

	return {
		scrollToBottom,
	};
};
