'use client';

import { cn } from '@/src/lib/utils';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getConversation } from '../lib/chatHistory';
import type { Conversation } from '../types/chatHistory';
import ConversationActionsMenu from './conversationActionsMenu';
import { useRouter } from 'next/navigation';
import { useChatStore } from '@/src/stores/chat/chatStore';

interface ChatNavbarProps {
	chatId: string;
	className?: string;
	style?: React.CSSProperties;
}

const ChatNavbar = ({
	chatId,
	className = '',
	style = {},
}: ChatNavbarProps) => {
	const [conversation, setConversation] = useState<Conversation | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const conversationsDirty = useChatStore((s) => s.conversationsDirty);
	const router = useRouter();

	useEffect(() => {
		let mounted = true;

		const fetchConversation = async () => {
			if (!chatId) return;

			setIsLoading(true);
			setError(null);

			try {
				const data = await getConversation(chatId);
				if (mounted) {
					setConversation(data);
				}
			} catch (err) {
				if (mounted) {
					setError('Failed to load conversation');
					console.error('Failed to fetch conversation:', err);
				}
			} finally {
				if (mounted) {
					setIsLoading(false);
				}
			}
		};

		fetchConversation();

		return () => {
			mounted = false;
		};
	}, [chatId, conversationsDirty]);

	const displayTitle = () => {
		if (isLoading) {
			return (
				<div className="flex items-center gap-2">
					<Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
					<span className="text-muted-foreground">Loading conversation...</span>
				</div>
			);
		}

		if (error || !conversation) {
			return <span className="text-foreground">New conversation</span>;
		}

		return (
			<span className="text-foreground font-medium">
				{conversation.title || 'New conversation'}
			</span>
		);
	};

	return (
		<header
			className={cn(
				'flex h-16 items-center justify-between bg-background px-6',
				className,
			)}
			style={style}
		>
			<div className="flex items-center gap-4">
				<Link
					href="/"
					className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
				>
					<ArrowLeft className="h-5 w-5" />
					<span className="hidden sm:inline text-sm font-medium">Back</span>
				</Link>

				<div className="h-6 w-px bg-border" />

				<div className="flex flex-col">
					<div className="flex items-center gap-2">{displayTitle()}</div>
					{conversation && !isLoading && (
						<p className="text-xs text-muted-foreground mt-0.5">
							{conversation.messages?.length || 0} messages
						</p>
					)}
				</div>
			</div>

			<div className="flex items-center gap-4">
				<ConversationActionsMenu
					conversationId={chatId}
					currentTitle={conversation?.title || ''}
					onTitleUpdated={(newTitle) => {
						setConversation((prev) =>
							prev ? { ...prev, title: newTitle } : null,
						);
					}}
					onDeleted={() => {
						if (window.location.pathname.includes(chatId)) {
							router.push('/');
						}
					}}
				/>
			</div>
		</header>
	);
};

export default ChatNavbar;
