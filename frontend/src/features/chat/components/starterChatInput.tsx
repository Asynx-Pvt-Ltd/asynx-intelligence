'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useChatStore } from '@/src/stores/chat/chatStore';
import { createConversation } from '@/src/features/chat/lib/chatHistory';
import ChatInputHeader from './chatInputHeader';
import ChatInput from './chatInput';

const StarterChatInput = () => {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const setPendingPrompt = useChatStore((state) => state.setPendingPrompt);

	const handleCreateConversation = async (value: string) => {
		try {
			setIsSubmitting(true);

			const conversation = await createConversation({
				title: value.slice(0, 60),
			});

			setPendingPrompt(value);
			router.push(`/chat/${conversation.id}`);
		} catch (error) {
			console.error('Failed to create conversation:', error);
			throw error;
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<ChatInput
			onSubmit={handleCreateConversation}
			isSubmitting={isSubmitting}
			header={<ChatInputHeader title="Enterprise AI Chatbot" />}
			className="max-w-3xl"
		/>
	);
};

export default StarterChatInput;
