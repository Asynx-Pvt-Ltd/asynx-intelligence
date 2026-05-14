'use client';

import { cn } from '@/src/lib/utils';
import { useChatStore } from '@/src/stores/chat/chatStore';
import { useChatSidebarStore } from '@/src/stores/chat/chatSidebarStore';
import { motion } from 'framer-motion';
import { Check, Loader2, PanelLeft, Pencil, Share2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { getConversation, updateConversation } from '../lib/chatHistory';
import type { Conversation } from '../types/chatHistory';
import ConversationActionsMenu from './conversationActionsMenu';
import ModelSelector from '@/src/components/chat/ModelSelector';
import { Button } from '@/src/components/ui/button';
import Logo from '@/src/components/ui/logo';

interface ChatNavbarProps {
	chatId: string;
	className?: string;
}

export default function ChatNavbar({ chatId, className }: ChatNavbarProps) {
	const [conversation, setConversation] = useState<Conversation | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isEditingTitle, setIsEditingTitle] = useState(false);
	const [editedTitle, setEditedTitle] = useState('');
	const [isSavingTitle, setIsSavingTitle] = useState(false);

	const titleInputRef = useRef<HTMLInputElement>(null);
	const router = useRouter();
	const bumpConversationsDirty = useChatStore((s) => s.bumpConversationsDirty);
	const conversationsDirty = useChatStore((s) => s.conversationsDirty);
	const { isOpen, toggle } = useChatSidebarStore();

	useEffect(() => {
		let mounted = true;

		const fetch = async () => {
			if (!chatId) return;
			setIsLoading(true);
			try {
				const data = await getConversation(chatId);
				if (mounted) setConversation(data);
			} catch {
				/* no-op */
			} finally {
				if (mounted) setIsLoading(false);
			}
		};

		void fetch();
		return () => {
			mounted = false;
		};
	}, [chatId, conversationsDirty]);

	const startEditingTitle = () => {
		setEditedTitle(conversation?.title ?? '');
		setIsEditingTitle(true);
		setTimeout(() => {
			titleInputRef.current?.select();
		}, 0);
	};

	const cancelEditingTitle = () => {
		setIsEditingTitle(false);
		setEditedTitle('');
	};

	const saveTitle = async () => {
		const trimmed = editedTitle.trim();
		if (!trimmed || trimmed === conversation?.title) {
			cancelEditingTitle();
			return;
		}
		setIsSavingTitle(true);
		try {
			await updateConversation(chatId, { title: trimmed });
			setConversation((prev) => (prev ? { ...prev, title: trimmed } : null));
			bumpConversationsDirty();
		} catch {
			/* revert silently */
		} finally {
			setIsSavingTitle(false);
			setIsEditingTitle(false);
		}
	};

	const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			void saveTitle();
		}
		if (e.key === 'Escape') cancelEditingTitle();
	};

	return (
		<motion.header
			initial={{ opacity: 0, y: -4 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
			className={cn(
				'flex h-12 items-center justify-between gap-4 px-4',
				'bg-background/80 backdrop-blur-xl',
				'border-b border-border',
				className,
			)}
		>
			{/* Left: toggle + logo dot + title */}
			<div className="flex items-center gap-2 min-w-0 flex-1">
				<div className="min-w-0 flex-1">
					{isLoading ? (
						<div className="h-4 w-32 rounded shimmer" />
					) : isEditingTitle ? (
						<div className="flex items-center gap-1.5">
							<input
								ref={titleInputRef}
								value={editedTitle}
								onChange={(e) => setEditedTitle(e.target.value)}
								onKeyDown={handleTitleKeyDown}
								onBlur={() => void saveTitle()}
								className={cn(
									'h-7 min-w-0 flex-1 max-w-xs rounded-md px-2 text-sm font-medium',
									'bg-muted border border-border text-foreground',
									'outline-none focus:ring-1 focus:ring-ring',
								)}
								autoFocus
								aria-label="Edit conversation title"
							/>
							<button
								onMouseDown={(e) => {
									e.preventDefault();
									void saveTitle();
								}}
								disabled={isSavingTitle}
								aria-label="Save title"
								className="flex h-6 w-6 items-center justify-center rounded-md text-primary hover:bg-primary/10 transition-colors"
							>
								{isSavingTitle ? (
									<Loader2 className="h-3.5 w-3.5 animate-spin" />
								) : (
									<Check className="h-3.5 w-3.5" />
								)}
							</button>
							<button
								onMouseDown={(e) => {
									e.preventDefault();
									cancelEditingTitle();
								}}
								aria-label="Cancel editing"
								className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted transition-colors"
							>
								<X className="h-3.5 w-3.5" />
							</button>
						</div>
					) : (
						<button
							onClick={startEditingTitle}
							className={cn(
								'group flex items-center gap-1.5 rounded-md px-1 -ml-1',
								'text-sm font-medium text-foreground truncate max-w-xs',
								'hover:bg-muted/60 transition-colors duration-150',
								'outline-none focus-visible:ring-1 focus-visible:ring-ring',
							)}
							title="Click to rename"
							aria-label="Edit conversation title"
						>
							<span className="truncate">
								{conversation?.title || 'New conversation'}
							</span>
							<Pencil className="h-3 w-3 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
						</button>
					)}
				</div>
			</div>

			{/* Right: model selector + divider + share + actions */}
			<div className="flex items-center gap-1 shrink-0">
				{/* <ModelSelector /> */}

				{/* <div className="h-4 w-px bg-border mx-1" aria-hidden /> */}

				{/* <Button
					variant="ghost"
					size="sm"
					className="h-7 gap-1.5 px-2.5 text-xs text-muted-foreground hover:text-foreground"
					aria-label="Share conversation"
				>
					<Share2 className="h-3.5 w-3.5" />
					<span className="hidden sm:inline">Share</span>
				</Button> */}

				<ConversationActionsMenu
					conversationId={chatId}
					currentTitle={conversation?.title ?? ''}
					onTitleUpdated={(t) =>
						setConversation((prev) => (prev ? { ...prev, title: t } : null))
					}
					onDeleted={() => {
						if (window.location.pathname.includes(chatId)) router.push('/');
					}}
					className="h-7 w-7"
				/>
			</div>
		</motion.header>
	);
}
