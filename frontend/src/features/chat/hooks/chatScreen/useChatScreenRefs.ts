import { Dispatch, SetStateAction, useEffect, useRef } from 'react';
import { Message } from '../../types/chatTypes';

interface useChatScreenRefsProps {
	messages: Message[];
	setShowScrollBtn: Dispatch<SetStateAction<boolean>>;
}

export const useChatScreenRefs = ({
	messages,
	setShowScrollBtn,
}: useChatScreenRefsProps) => {
	const initializedRef = useRef(false);
	const streamRunIdRef = useRef(0);
	const messagesRef = useRef<Message[]>([]);
	const scrollContainerRef = useRef<HTMLDivElement | null>(null);
	const bottomRef = useRef<HTMLDivElement | null>(null);

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

	useEffect(() => {
		messagesRef.current = messages;
	}, [messages]);

	return {
		initializedRef,
		streamRunIdRef,
		messagesRef,
		scrollContainerRef,
		bottomRef,
	};
};
