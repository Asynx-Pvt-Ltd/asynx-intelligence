'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { nanoid } from 'nanoid';
import { Button } from '@/src/components/ui/button';
import { Textarea } from '@/src/components/ui/textarea';
import { useChatStore } from '@/src/stores/chat/chatStore';
import { ArrowUp } from 'lucide-react';

const StarterChatInput = () => {
	const router = useRouter();
	const [prompt, setPrompt] = useState('');
	const setPendingPrompt = useChatStore((state) => state.setPendingPrompt);

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();

		const trimmed = prompt.trim();
		if (!trimmed) return;

		const chatId = nanoid();

		setPendingPrompt(trimmed);
		router.push(`/chat/${chatId}`);
	};

	return (
		<form onSubmit={handleSubmit} className="w-full h-full max-w-3xl">
			<div className="text-center p-5">
				<h1 className="text-4xl">Enterprise AI Chatbot</h1>
			</div>
			<div className="rounded-3xl border bg-background shadow-sm">
				<Textarea
					value={prompt}
					onChange={(e) => setPrompt(e.target.value)}
					placeholder="Ask anything..."
					className="min-h-35 resize-none border-0 bg-transparent px-5 py-4 text-base shadow-none focus-visible:ring-0"
				/>

				<div className="flex items-center justify-between px-4 pb-4">
					<p className="text-xs text-muted-foreground">
						Press Enter to send, Shift + Enter for newline
					</p>

					<Button
						type="submit"
						size="icon"
						disabled={!prompt.trim()}
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
