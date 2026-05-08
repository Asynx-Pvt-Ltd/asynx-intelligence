'use client';

import { Button } from '@/src/components/ui/button';
import Logo from '@/src/components/ui/logo';
import { ThemeToggle } from '@/src/components/ui/themeToggle';
import { cn } from '@/src/lib/utils';
import { useChatSidebarStore } from '@/src/stores/chat/chatSidebarStore';
import { useChatStore } from '@/src/stores/chat/chatStore';
import { OrganizationSwitcher } from '@clerk/nextjs';
import { PanelLeft, PenSquare, Search } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import ConversationActionsMenu from '../../chat/components/conversationActionsMenu';
import { getConversations } from '../../chat/lib/chatHistory';
import { Conversation } from '../../chat/types/chatHistory';
import SignOutButton from './signOutButton';
import { Input } from '@/src/components/ui/input';

interface SidebarProps {
	className?: string;
	style?: React.CSSProperties;
	onNewChat: () => void;
}

const Sidebar = ({ className = '', style = {}, onNewChat }: SidebarProps) => {
	const pathname = usePathname();
	const [chats, setChats] = useState<Conversation[]>([]);
	const [search, setSearch] = useState('');
	const [hoveredId, setHoveredId] = useState<string | null>(null);

	const conversationsDirty = useChatStore((s) => s.conversationsDirty);

	const isOpen = useChatSidebarStore((state) => state.isOpen);
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

	const filteredChats = chats.filter((chat) =>
		chat.title?.toLowerCase().includes(search.toLowerCase()),
	);

	return (
		<aside
			className={cn(
				'flex h-screen shrink-0 flex-row  bg-background transition-[width] duration-300 ease-in-out',
				isOpen ? 'w-sm' : 'w-16',
				className,
			)}
			style={style}
		>
			<div className="flex w-16 flex-col items-center justify-between dark:bg-[#1E1F22] px-2 py-3 not-dark:border-r border-r-gray-300">
				<div className="flex flex-col items-center gap-4">
					<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
						<Logo />
					</div>

					<Button
						variant="ghost"
						size="icon"
						onClick={toggle}
						aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
						aria-expanded={isOpen}
					>
						<PanelLeft className="h-5 w-5" />
					</Button>
				</div>

				<div className="flex flex-col items-center gap-3">
					<OrganizationSwitcher
						afterSelectOrganizationUrl="/"
						appearance={{
							elements: {
								rootBox: 'w-8 h-8',
								organizationSwitcherTrigger:
									'w-8 h-8 rounded-full border border-border bg-background flex items-center justify-center',
								organizationPreview: 'hidden',
								organizationAvatarBox: 'w-5 h-5',
								organizationSwitcherTriggerIcon: 'w-3 h-3',
							},
						}}
					/>
					<ThemeToggle />
					<SignOutButton />
				</div>
			</div>

			<div
				className={cn(
					'flex flex-1 flex-col overflow-hidden',
					!isOpen && 'pointer-events-none opacity-0',
				)}
			>
				<div className="flex w-full flex-col gap-2 px-3 py-3">
					<Button
						onClick={onNewChat}
						className="w-full justify-start rounded-xl"
						aria-label="New chat"
					>
						<PenSquare className="mr-2 h-4 w-4" />
						New Chat
					</Button>
					<div className="relative">
						<Search className="absolute top-2.5 left-3 w-3 h-3 text-[#575B65]" />
						<Input
							type="text"
							className="rounded-md! pl-8! py-2! h-8 w-full bg-[#D6D6D6]! px-2 text-sm outline-none text-black  placeholder:text-[#575B65] placeholder:text-sm"
							placeholder="Search..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>
					</div>
				</div>

				<div className="flex-1 overflow-y-auto px-3 pb-2">
					<div className="mb-2 px-1 text-xs font-medium text-muted-foreground">
						Recent
					</div>

					<div className="space-y-1">
						{filteredChats.map((chat, index) => {
							const isActive = pathname === `/chat/${chat.id}`;
							const isLastIndex = filteredChats.length - 1 === index;
							const isHovered = hoveredId === chat.id;
							return (
								<Link
									onMouseEnter={() => setHoveredId(chat.id)}
									onMouseLeave={() =>
										setHoveredId((prev) => (prev === chat.id ? null : prev))
									}
									key={chat.id}
									href={`/chat/${chat.id}`}
									className={cn(
										'flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm transition-colors',
										isActive
											? 'bg-muted text-foreground'
											: 'text-muted-foreground hover:bg-muted hover:text-foreground',
									)}
									title={chat.title || 'Untitled Chat'}
								>
									<span className="line-clamp-2 flex-1 text-left">
										{chat.title || 'Untitled Chat'}
									</span>

									<RowMenuWrapper
										chatId={chat.id}
										chatTitle={chat.title || ''}
										isActive={isActive}
										isLastIndex={isLastIndex}
										isHovered={isHovered}
									/>
								</Link>
							);
						})}
					</div>
				</div>
			</div>
		</aside>
	);
};

export default Sidebar;

const RowMenuWrapper = ({
	chatId,
	chatTitle,
	isActive,
	isLastIndex,
	isHovered,
}: {
	chatId: string;
	chatTitle: string;
	isActive: boolean;
	isLastIndex: boolean;
	isHovered: boolean;
}) => {
	const [menuOpen, setMenuOpen] = useState(false);

	const shouldShow = isActive || isHovered || menuOpen;

	return (
		<div
			className={cn(
				'transition-opacity',
				shouldShow ? 'opacity-100' : 'opacity-0',
			)}
			onClick={(e) => {
				e.preventDefault();
				e.stopPropagation();
			}}
		>
			<ConversationActionsMenu
				conversationId={chatId}
				currentTitle={chatTitle}
				placement={isLastIndex ? 'top' : 'bottom'}
				className="h-7 w-7 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
				onOpenChange={setMenuOpen}
			/>
		</div>
	);
};
