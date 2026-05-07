'use client';

import { Button } from '@/src/components/ui/button';
import { cn } from '@/src/lib/utils';
import { useChatSidebarStore } from '@/src/stores/chat/chatSidebarStore';
import { MessageSquare, PanelLeft, PenSquare } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getConversations } from '../../chat/lib/chatHistory';
import { Conversation } from '../../chat/types/chatHistory';
import { useChatStore } from '@/src/stores/chat/chatStore';

interface SidebarProps {
	className?: string;
	style?: React.CSSProperties;
	onNewChat: () => void;
}

const Sidebar = ({ className = '', style = {}, onNewChat }: SidebarProps) => {
	const pathname = usePathname();
	const [chats, setChats] = useState<Conversation[]>([]);

	const conversationsDirty = useChatStore((s) => s.conversationsDirty);

	const isOpen = useChatSidebarStore((state) => state.isOpen);
	const open = useChatSidebarStore((state) => state.open);
	const toggle = useChatSidebarStore((state) => state.toggle);

	useEffect(() => {
		const fetchConversations = async () => {
			try {
				const convs = await getConversations();
				setChats(convs);
			} catch (error) {
				console.error('Failed to fetch conversations:', error);
			}
		};

		void fetchConversations();
	}, [conversationsDirty]);

	return (
		<aside
			onClick={() => {
				if (!isOpen) {
					open();
				}
			}}
			className={cn(
				'flex h-screen shrink-0 flex-col overflow-hidden border-r bg-background transition-[width] duration-300 ease-in-out cursor-pointer hover:brightness-110',
				isOpen ? 'w-72' : 'w-20',
				className,
			)}
			style={style}
		>
			<div
				className={cn(
					'flex h-16 items-center gap-2 px-3',
					!isOpen && 'justify-center px-2',
				)}
			>
				<Button
					variant="ghost"
					size="icon"
					onClick={(e) => {
						e.preventDefault();
						toggle();
					}}
					aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
					aria-expanded={isOpen}
				>
					<PanelLeft className="h-5 w-5" />
				</Button>

				{isOpen && (
					<Button
						onClick={onNewChat}
						className={cn(
							'rounded-xl transition-all duration-300',
							'flex-1 justify-start',
						)}
						aria-label="New chat"
					>
						<PenSquare className={cn('h-4 w-4')} />
						New Chat
					</Button>
				)}
			</div>

			<div className="flex-1 overflow-y-auto p-2">
				{isOpen && (
					<div className="mb-2 px-2 text-xs font-medium text-muted-foreground">
						Recent
					</div>
				)}

				<div className="space-y-1">
					{isOpen &&
						chats.map((chat) => {
							const isActive = pathname === `/chat/${chat.id}`;

							return (
								<Link
									key={chat.id}
									href={`/chat/${chat.id}`}
									className={cn(
										'flex rounded-xl text-sm transition-colors',
										isOpen
											? 'items-start gap-3 px-3 py-3'
											: 'justify-center px-2 py-3',
										isActive
											? 'bg-muted text-foreground'
											: 'text-muted-foreground hover:bg-muted hover:text-foreground',
									)}
									title={!isOpen ? chat.title : undefined}
								>
									<MessageSquare className="mt-0.5 h-4 w-4 shrink-0" />
									{isOpen && (
										<span className="line-clamp-2">
											{chat.title || 'Untitled Chat'}
										</span>
									)}
								</Link>
							);
						})}
				</div>
			</div>
		</aside>
	);
};

export default Sidebar;
