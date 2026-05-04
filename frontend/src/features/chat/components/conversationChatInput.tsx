'use client';

import { useState } from 'react';
import ChatInput from './chatInput';

interface ConversationChatInputProps {
	onSendMessage: (value: string) => Promise<void>;
	disabled?: boolean;
}

const ConversationChatInput = ({
	onSendMessage,
	disabled = false,
}: ConversationChatInputProps) => {
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (value: string) => {
		try {
			setIsSubmitting(true);
			await onSendMessage(value);
		} catch (error) {
			console.error('Failed to send message:', error);
			throw error;
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<ChatInput
			onSubmit={handleSubmit}
			isSubmitting={isSubmitting}
			disabled={disabled}
			placeholder="Ask a follow-up"
		/>
	);
};

export default ConversationChatInput;
