'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/src/components/ui/button';
import { Textarea } from '@/src/components/ui/textarea';
import { useChatStore } from '@/src/stores/chat/chatStore';
import { ArrowUp } from 'lucide-react';
import { createConversation } from '@/src/features/chat/lib/chatHistory';

const StarterChatInput = () => {
	const router = useRouter();
	const [prompt, setPrompt] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const setPendingPrompt = useChatStore((state) => state.setPendingPrompt);

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();

		const trimmed = prompt.trim();
		if (!trimmed || isSubmitting) return;

		try {
			setIsSubmitting(true);

			const conversation = await createConversation({
				title: trimmed.slice(0, 60),
			});

			setPendingPrompt(trimmed);
			setPrompt('');

			router.push(`/chat/${conversation.id}`);
		} catch (error) {
			console.error('Failed to create conversation:', error);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="h-full w-full max-w-3xl">
			<div className="p-5 text-center">
				<h1 className="text-4xl">Enterprise AI Chatbot</h1>
			</div>

			<div className="rounded-3xl border bg-background shadow-sm">
				<Textarea
					value={prompt}
					onChange={(e) => setPrompt(e.target.value)}
					placeholder="Ask anything..."
					className="min-h-35 resize-none border-0 bg-transparent px-5 py-4 text-base shadow-none focus-visible:ring-0"
					disabled={isSubmitting}
				/>

				<div className="flex items-center justify-between px-4 pb-4">
					<p className="text-xs text-muted-foreground">
						Press Enter to send, Shift + Enter for newline
					</p>

					<Button
						type="submit"
						size="icon"
						disabled={!prompt.trim() || isSubmitting}
						className="rounded-full"
					>
						<ArrowUp className="h-4 w-4" />
					</Button>
				</div>
			</div>
		</form>
	);
};

export default StarterChatInput;
