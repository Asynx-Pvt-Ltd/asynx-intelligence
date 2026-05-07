'use client';

import { cn } from '@/src/lib/utils';
import { ArrowLeft, MoreVertical, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getConversation } from '../lib/chatHistory';
import type { Conversation } from '../types/chatHistory';

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
	}, [chatId]);

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
				'flex h-16 items-center justify-between bg-background px-6 border-b border-border',
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
					<div className="flex items-center gap-2">
						{displayTitle()}
						{conversation?.is_draft && (
							<span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
								Draft
							</span>
						)}
					</div>
					{conversation && !isLoading && (
						<p className="text-xs text-muted-foreground mt-0.5">
							{conversation.messages?.length || 0} messages
						</p>
					)}
				</div>
			</div>

			<div className="flex items-center gap-4">
				<div className="hidden md:flex items-center gap-3">
					<button className="px-3 py-1.5 text-sm rounded-md border border-input bg-background hover:bg-accent transition-colors">
						Share
					</button>
					<button className="px-3 py-1.5 text-sm rounded-md border border-input bg-background hover:bg-accent transition-colors">
						Export
					</button>
				</div>

				<button className="p-2 rounded-md hover:bg-accent transition-colors">
					<MoreVertical className="h-5 w-5 text-muted-foreground" />
				</button>
			</div>
		</header>
	);
};

export default ChatNavbar;
